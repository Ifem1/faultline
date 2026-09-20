import hashlib
import json
import sys
from datetime import datetime, timezone

import pytest


NOW = 2_000_000_000
BOND = 10**18
EVIDENCE_BOND = 10**15
DIGEST = "ab" * 32
SALT = "cd" * 32


def addr(value):
    raw = value.as_bytes if hasattr(value, "as_bytes") else value
    if isinstance(raw, bytes):
        return "0x" + raw.hex()
    if hasattr(value, "as_hex"):
        return value.as_hex
    return str(value)


def warp(vm, unix):
    value = datetime.fromtimestamp(unix, timezone.utc).isoformat()
    vm.warp(value)
    module = sys.modules.get("_contract_faultline")
    if module:
        module.gl.message_raw["datetime"] = value


@pytest.fixture(autouse=True)
def fixed_clock(direct_vm):
    warp(direct_vm, NOW)


def pack(parts):
    return "".join(f"{len(part)}:{part}" for part in parts)


def commitment(vm, incident_id, submitter, family, url, fact, salt=SALT):
    return hashlib.sha256(
        pack(
            [
                "faultline-evidence-v1",
                "61999",
                addr(vm._contract_address).lower(),
                incident_id,
                addr(submitter).lower(),
                family,
                url,
                fact,
                salt,
            ]
        ).encode()
    ).hexdigest()


def mock_llm(vm, result):
    vm.clear_mocks()
    vm.mock_llm(r"(?s).*", json.dumps(result))


def mock_source(vm, body="Security advisory body"):
    vm.mock_web(r"(?s).*", {"status": 200, "body": body})


def source_result(**changes):
    base = {
        "source_available": True,
        "family_matches": True,
        "same_package": True,
        "material": True,
        "publication_in_window": True,
        "version_discussed": True,
        "release_affected": True,
        "severity_qualifies": True,
        "class_matches": True,
        "exclusion_applies": False,
        "advisory_id": "CVE-2099-0001",
        "affected_range": ">=3.7.0 <=3.7.4",
        "basis": "The advisory names the package, affected range, critical severity, and remote execution condition.",
    }
    base.update(changes)
    return base


def breach_result(**changes):
    base = {
        "affected_release": True,
        "disclosure_in_window": True,
        "severity_qualifies": True,
        "class_matches": True,
        "exclusion_applies": False,
        "evidence_consistent": True,
        "verdict": "BREACHED",
        "basis": "Two distinct source families establish the covered release and warranty conditions.",
    }
    base.update(changes)
    return base


def setup_release_and_warranty(vm, contract, publisher):
    vm.sender = publisher
    release_id = contract.register_release(
        "npm",
        "@demo/parser",
        "3.7.4",
        DIGEST,
        "https://example.com/releases/3.7.4",
    )
    vm.value = BOND
    try:
        warranty_id = contract.open_warranty(
            release_id,
            "Critical RCE warranty",
            "CVSS >= 9.0 or explicitly classified CRITICAL",
            "remote code execution",
            "local-admin-only, development-only dependency, unsupported fork",
            500,
            NOW + 600,
            NOW + 7200,
            1800,
            2,
            2,
            EVIDENCE_BOND,
        )
    finally:
        vm.value = 0
    return release_id, warranty_id


def open_incident(vm, contract, warranty_id, opener):
    warp(vm, NOW + 601)
    vm.sender = opener
    return contract.open_incident(warranty_id, "Potential critical RCE", "CVE-2099-0001")


def submit_verified(vm, contract, incident_id, submitter, family, url, fact):
    digest = commitment(vm, incident_id, submitter, family, url, fact)
    vm.sender = submitter
    vm.value = EVIDENCE_BOND
    try:
        evidence_id = contract.commit_evidence(incident_id, digest)
    finally:
        vm.value = 0
    contract.reveal_evidence(evidence_id, family, url, fact, SALT)
    vm.sender = vm._contract_address
    mock_llm(vm, source_result())
    mock_source(vm)
    contract.evaluate_evidence(evidence_id)
    assert vm.run_validator() is True
    return evidence_id


def commit_only(vm, contract, incident_id, submitter, family, url, fact, salt=SALT):
    digest = commitment(vm, incident_id, submitter, family, url, fact, salt)
    vm.sender = submitter
    vm.value = EVIDENCE_BOND
    try:
        evidence_id = contract.commit_evidence(incident_id, digest)
    finally:
        vm.value = 0
    return evidence_id


def examine(vm, contract, evidence_id, result=None, status=200):
    vm.sender = vm._contract_address
    vm.clear_mocks()
    if status != 200:
        vm.mock_web(r"(?s).*", {"status": status, "body": "unavailable"})
    else:
        mock_llm(vm, result or source_result())
        mock_source(vm)
    contract.evaluate_evidence(evidence_id)
    assert vm.run_validator() is True


def test_release_and_warranty_are_real_funded_records(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/faultline.py")
    release_id, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    release = contract.get_release(release_id)
    warranty = contract.get_warranty(warranty_id)
    assert release["package_name"] == "@demo/parser"
    assert warranty["status"] == "OPEN"
    assert warranty["bond_atto"] == str(BOND)
    assert contract.get_stats()["accounting_balanced"] is True


def test_only_release_publisher_can_open_warranty(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    direct_vm.sender = direct_alice
    release_id = contract.register_release("npm", "pkg", "1.0.0", DIGEST, "https://example.com/r")
    direct_vm.sender = direct_bob
    direct_vm.value = BOND
    with pytest.raises(Exception, match="publisher"):
        contract.open_warranty(
            release_id,
            "Warranty",
            "critical",
            "remote code execution",
            "none",
            500,
            NOW + 600,
            NOW + 7200,
            1800,
            2,
            2,
            EVIDENCE_BOND,
        )
    direct_vm.value = 0


def test_coverage_premium_and_capacity(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    coverage = 2 * 10**17
    premium = (coverage * 500 + 9999) // 10000
    direct_vm.sender = direct_bob
    direct_vm.value = premium
    contract.buy_coverage(warranty_id, coverage)
    direct_vm.value = 0
    assert contract.get_coverage(warranty_id, addr(direct_bob))["coverage_atto"] == str(coverage)
    assert contract.get_credit(addr(direct_alice)) == str(premium)
    assert contract.get_stats()["accounting_balanced"] is True


def test_incident_cannot_open_until_coverage_closes(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    direct_vm.sender = direct_bob
    with pytest.raises(Exception, match="before coverage closes"):
        contract.open_incident(warranty_id, "RCE", "CVE-X")


def test_commitment_binds_chain_contract_incident_wallet_and_source(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    url = "https://security.example.com/advisory"
    fact = "Release 3.7.4 is affected."
    computed = contract.compute_evidence_commitment(
        incident_id, addr(direct_bob), "VENDOR", url, fact, SALT
    )
    assert computed == commitment(direct_vm, incident_id, direct_bob, "VENDOR", url, fact)
    address_type = sys.modules["_contract_faultline"].Address
    decoded_address = address_type(direct_bob)
    computed_from_decoded_address = contract.compute_evidence_commitment(
        incident_id, decoded_address, "VENDOR", url, fact, SALT
    )
    assert computed_from_decoded_address == computed
    bad = hashlib.sha256(b"wrong").hexdigest()
    direct_vm.sender = direct_bob
    direct_vm.value = EVIDENCE_BOND
    evidence_id = contract.commit_evidence(incident_id, bad)
    direct_vm.value = 0
    with pytest.raises(Exception, match="match commitment"):
        contract.reveal_evidence(evidence_id, "VENDOR", url, fact, SALT)


def test_verified_source_returns_bond_and_records_substantive_fields(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    evidence_id = submit_verified(
        direct_vm,
        contract,
        incident_id,
        direct_bob,
        "VENDOR",
        "https://vendor.example.com/advisory",
        "Vendor says 3.7.4 is affected by critical RCE.",
    )
    record = contract.get_evidence(evidence_id)
    assert record["status"] == "VERIFIED"
    assert record["release_affected"] is True
    assert record["severity_qualifies"] is True
    assert record["class_matches"] is True
    assert contract.get_credit(addr(direct_bob)) == str(EVIDENCE_BOND)


def test_source_unavailable_is_retryable_non_decision(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    url = "https://vendor.example.com/down"
    fact = "Potential advisory"
    direct_vm.sender = direct_bob
    direct_vm.value = EVIDENCE_BOND
    evidence_id = contract.commit_evidence(incident_id, commitment(direct_vm, incident_id, direct_bob, "VENDOR", url, fact))
    direct_vm.value = 0
    contract.reveal_evidence(evidence_id, "VENDOR", url, fact, SALT)
    direct_vm.sender = direct_vm._contract_address
    direct_vm.clear_mocks()
    direct_vm.mock_web(r"(?s).*", {"status": 503, "body": "unavailable"})
    contract.evaluate_evidence(evidence_id)
    assert direct_vm.run_validator() is True
    assert contract.get_evidence(evidence_id)["status"] == "SOURCE_UNAVAILABLE"
    assert contract.get_credit(addr(direct_bob)) == str(EVIDENCE_BOND)
    direct_vm.sender = direct_bob
    contract.retry_evidence(evidence_id)
    assert contract.get_evidence(evidence_id)["status"] == "PENDING_SOURCE"


def test_invalid_source_is_not_counted_and_bond_goes_to_publisher(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    url = "https://unrelated.example.com/post"
    fact = "Unrelated post"
    direct_vm.sender = direct_bob
    direct_vm.value = EVIDENCE_BOND
    evidence_id = contract.commit_evidence(incident_id, commitment(direct_vm, incident_id, direct_bob, "SECURITY_RESEARCH", url, fact))
    direct_vm.value = 0
    contract.reveal_evidence(evidence_id, "SECURITY_RESEARCH", url, fact, SALT)
    direct_vm.sender = direct_vm._contract_address
    mock_llm(direct_vm, source_result(same_package=False, material=False, release_affected=False))
    mock_source(direct_vm)
    contract.evaluate_evidence(evidence_id)
    assert direct_vm.run_validator() is True
    assert contract.get_evidence(evidence_id)["status"] == "INVALID_SOURCE"
    assert contract.get_incident(incident_id)["verified_count"] == "0"
    assert contract.get_credit(addr(direct_alice)) == str(EVIDENCE_BOND)


def test_validator_replays_source_decision_fields(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    url = "https://vendor.example.com/advisory"
    fact = "3.7.4 affected"
    direct_vm.sender = direct_bob
    direct_vm.value = EVIDENCE_BOND
    evidence_id = contract.commit_evidence(incident_id, commitment(direct_vm, incident_id, direct_bob, "VENDOR", url, fact))
    direct_vm.value = 0
    contract.reveal_evidence(evidence_id, "VENDOR", url, fact, SALT)
    direct_vm.sender = direct_vm._contract_address
    mock_llm(direct_vm, source_result(release_affected=True))
    mock_source(direct_vm)
    contract.evaluate_evidence(evidence_id)
    direct_vm.clear_mocks()
    direct_vm.mock_web(r"(?s).*", {"status": 200, "body": "same advisory"})
    direct_vm.mock_llm(r"(?s).*", json.dumps(source_result(release_affected=False)))
    assert direct_vm.run_validator() is False


def test_breach_requires_two_source_families_and_moves_bond_to_payout_reserve(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    coverage = 2 * 10**17
    premium = (coverage * 500 + 9999) // 10000
    direct_vm.sender = direct_charlie
    direct_vm.value = premium
    contract.buy_coverage(warranty_id, coverage)
    direct_vm.value = 0
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    submit_verified(direct_vm, contract, incident_id, direct_bob, "VENDOR", "https://vendor.example.com/a", "3.7.4 affected")
    submit_verified(direct_vm, contract, incident_id, direct_charlie, "NVD", "https://nvd.example.com/b", "3.7.4 affected")
    direct_vm.sender = direct_bob
    mock_llm(direct_vm, breach_result())
    assert contract.adjudicate_incident(incident_id) == "BREACHED"
    assert direct_vm.run_validator() is True
    warranty = contract.get_warranty(warranty_id)
    assert warranty["status"] == "BREACHED"
    assert warranty["payout_reserve_atto"] == str(coverage)
    assert contract.get_stats()["accounting_balanced"] is True


def test_coverage_holder_can_claim_breach_payout(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    coverage = 10**17
    premium = (coverage * 500 + 9999) // 10000
    direct_vm.sender = direct_charlie
    direct_vm.value = premium
    contract.buy_coverage(warranty_id, coverage)
    direct_vm.value = 0
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    submit_verified(direct_vm, contract, incident_id, direct_bob, "VENDOR", "https://vendor.example.com/a", "affected")
    submit_verified(direct_vm, contract, incident_id, direct_charlie, "NVD", "https://nvd.example.com/b", "affected")
    mock_llm(direct_vm, breach_result())
    contract.adjudicate_incident(incident_id)
    assert direct_vm.run_validator() is True
    contract.claim_breach_payout(warranty_id, addr(direct_charlie))
    expected = EVIDENCE_BOND + coverage
    assert contract.get_credit(addr(direct_charlie)) == str(expected)
    assert contract.get_coverage(warranty_id, addr(direct_charlie))["claimed"] is True
    with pytest.raises(Exception, match="already claimed"):
        contract.claim_breach_payout(warranty_id, addr(direct_charlie))


def test_not_affected_closes_only_incident_not_warranty(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    submit_verified(direct_vm, contract, incident_id, direct_bob, "VENDOR", "https://vendor.example.com/a", "only 4.x affected")
    submit_verified(direct_vm, contract, incident_id, direct_charlie, "NVD", "https://nvd.example.com/b", "3.7.4 not affected")
    result = breach_result(affected_release=False, severity_qualifies=True, class_matches=True, exclusion_applies=False, evidence_consistent=True, verdict="NOT_AFFECTED")
    mock_llm(direct_vm, result)
    assert contract.adjudicate_incident(incident_id) == "NOT_AFFECTED"
    assert direct_vm.run_validator() is True
    assert contract.get_incident(incident_id)["status"] == "NOT_AFFECTED"
    assert contract.get_warranty(warranty_id)["status"] == "OPEN"


def test_inconclusive_keeps_incident_open_and_moves_no_warranty_money(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    submit_verified(direct_vm, contract, incident_id, direct_bob, "VENDOR", "https://vendor.example.com/a", "affected")
    submit_verified(direct_vm, contract, incident_id, direct_charlie, "NVD", "https://nvd.example.com/b", "not affected")
    mock_llm(
        direct_vm,
        breach_result(
            affected_release=False,
            severity_qualifies=False,
            class_matches=False,
            evidence_consistent=False,
            verdict="INCONCLUSIVE",
        ),
    )
    assert contract.adjudicate_incident(incident_id) == "INCONCLUSIVE"
    assert direct_vm.run_validator() is True
    assert contract.get_incident(incident_id)["status"] == "OPEN"
    assert contract.get_warranty(warranty_id)["status"] == "OPEN"
    assert contract.get_stats()["warranty_escrow_atto"] == str(BOND)


def test_warranty_expiry_returns_bond_when_no_incident(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    warp(direct_vm, NOW + 7201)
    direct_vm.sender = direct_alice
    contract.expire_warranty(warranty_id)
    assert contract.get_warranty(warranty_id)["status"] == "EXPIRED"
    assert contract.get_credit(addr(direct_alice)) == str(BOND)
    assert contract.get_stats()["accounting_balanced"] is True


def test_stats_and_lists_are_bounded(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/faultline.py")
    release_id, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    assert contract.list_releases(0, 25)["items"][0]["release_id"] == release_id
    assert contract.list_warranties(0, 25)["items"][0]["warranty_id"] == warranty_id
    with pytest.raises(Exception, match="page size"):
        contract.list_warranties(0, 26)
    stats = contract.get_stats()
    assert stats["chain_id"] == "61999"
    assert stats["admin_controls"] is False


def test_validator_replays_warranty_decision_fields(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    submit_verified(direct_vm, contract, incident_id, direct_bob, "VENDOR", "https://vendor.example.com/a", "affected")
    submit_verified(direct_vm, contract, incident_id, direct_charlie, "NVD", "https://nvd.example.com/b", "affected")
    mock_llm(direct_vm, breach_result())
    contract.adjudicate_incident(incident_id)
    mock_llm(
        direct_vm,
        breach_result(
            affected_release=False,
            severity_qualifies=True,
            class_matches=True,
            evidence_consistent=True,
            verdict="NOT_AFFECTED",
        ),
    )
    assert direct_vm.run_validator() is False


def test_duplicate_source_url_rejected_per_incident(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    url = "https://vendor.example.com/duplicate"
    fact = "3.7.4 affected"

    direct_vm.sender = direct_bob
    direct_vm.value = EVIDENCE_BOND
    first = contract.commit_evidence(incident_id, commitment(direct_vm, incident_id, direct_bob, "VENDOR", url, fact))
    direct_vm.value = 0
    contract.reveal_evidence(first, "VENDOR", url, fact, SALT)

    direct_vm.sender = direct_charlie
    other_salt = "ef" * 32
    digest = hashlib.sha256(
        pack([
            "faultline-evidence-v1", "61999", addr(direct_vm._contract_address).lower(), incident_id,
            addr(direct_charlie).lower(), "VENDOR", url, fact, other_salt,
        ]).encode()
    ).hexdigest()
    direct_vm.value = EVIDENCE_BOND
    second = contract.commit_evidence(incident_id, digest)
    direct_vm.value = 0
    with pytest.raises(Exception, match="already submitted"):
        contract.reveal_evidence(second, "VENDOR", url, fact, other_salt)


def test_unrevealed_evidence_expires_to_publisher(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    url = "https://vendor.example.com/late"
    fact = "late reveal"
    direct_vm.sender = direct_bob
    direct_vm.value = EVIDENCE_BOND
    evidence_id = contract.commit_evidence(incident_id, commitment(direct_vm, incident_id, direct_bob, "VENDOR", url, fact))
    direct_vm.value = 0
    reveal_deadline = int(contract.get_evidence(evidence_id)["reveal_deadline"])
    warp(direct_vm, reveal_deadline)
    contract.expire_unrevealed_evidence(evidence_id)
    assert contract.get_evidence(evidence_id)["status"] == "UNREVEALED"
    assert contract.get_credit(addr(direct_alice)) == str(EVIDENCE_BOND)
    assert contract.get_stats()["accounting_balanced"] is True


def test_source_family_diversity_required(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    submit_verified(direct_vm, contract, incident_id, direct_bob, "VENDOR", "https://vendor.example.com/a", "affected")
    submit_verified(direct_vm, contract, incident_id, direct_charlie, "VENDOR", "https://vendor2.example.com/b", "affected")
    with pytest.raises(Exception, match="source-family diversity"):
        contract.adjudicate_incident(incident_id)


def test_active_incident_blocks_warranty_expiry(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    open_incident(direct_vm, contract, warranty_id, direct_bob)
    warp(direct_vm, NOW + 7201)
    with pytest.raises(Exception, match="active incident"):
        contract.expire_warranty(warranty_id)


def test_capacity_tracks_active_evidence_but_keeps_history(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)

    unavailable_url = "https://vendor.example.com/capacity-unavailable"
    unavailable_fact = "Temporary outage"
    unavailable_id = commit_only(direct_vm, contract, incident_id, direct_bob, "VENDOR", unavailable_url, unavailable_fact)
    incident = contract.get_incident(incident_id)
    assert incident["evidence_count"] == "1"
    assert incident["evidence_capacity_used"] == "1"
    assert incident["evidence_capacity_remaining"] == "11"
    contract.reveal_evidence(unavailable_id, "VENDOR", unavailable_url, unavailable_fact, SALT)
    assert contract.get_incident(incident_id)["evidence_capacity_used"] == "1"  # PENDING_SOURCE still occupies its slot.
    examine(direct_vm, contract, unavailable_id, status=503)
    assert contract.get_evidence(unavailable_id)["status"] == "SOURCE_UNAVAILABLE"
    assert contract.get_incident(incident_id)["evidence_capacity_used"] == "0"

    direct_vm.sender = direct_bob
    contract.retry_evidence(unavailable_id)
    assert contract.get_incident(incident_id)["evidence_capacity_used"] == "1"
    examine(direct_vm, contract, unavailable_id, status=503)
    assert contract.get_incident(incident_id)["evidence_capacity_used"] == "0"

    invalid_url = "https://research.example.com/capacity-invalid"
    invalid_fact = "Unrelated article"
    invalid_id = commit_only(direct_vm, contract, incident_id, direct_bob, "SECURITY_RESEARCH", invalid_url, invalid_fact)
    contract.reveal_evidence(invalid_id, "SECURITY_RESEARCH", invalid_url, invalid_fact, SALT)
    assert contract.get_incident(incident_id)["evidence_capacity_used"] == "1"
    examine(direct_vm, contract, invalid_id, source_result(same_package=False, material=False))
    assert contract.get_evidence(invalid_id)["status"] == "INVALID_SOURCE"
    assert contract.get_incident(incident_id)["evidence_capacity_used"] == "0"

    unrevealed_id = commit_only(
        direct_vm, contract, incident_id, direct_bob, "VENDOR",
        "https://vendor.example.com/capacity-unrevealed", "Never revealed",
    )
    deadline = int(contract.get_evidence(unrevealed_id)["reveal_deadline"])
    warp(direct_vm, deadline)
    contract.expire_unrevealed_evidence(unrevealed_id)
    assert contract.get_evidence(unrevealed_id)["status"] == "UNREVEALED"
    incident = contract.get_incident(incident_id)
    assert incident["evidence_count"] == "3"  # History is never decremented.
    assert incident["evidence_capacity_used"] == "0"
    assert incident["evidence_capacity_limit"] == "12"
    assert contract.get_stats()["accounting_balanced"] is True


def test_retry_fails_cleanly_when_other_evidence_uses_all_capacity(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    url = "https://vendor.example.com/retry-capacity"
    fact = "Unavailable then retry"
    retry_id = commit_only(direct_vm, contract, incident_id, direct_bob, "VENDOR", url, fact)
    contract.reveal_evidence(retry_id, "VENDOR", url, fact, SALT)
    examine(direct_vm, contract, retry_id, status=503)
    assert contract.get_incident(incident_id)["evidence_capacity_used"] == "0"

    for index in range(12):
        commit_only(
            direct_vm, contract, incident_id, direct_bob, "VENDOR",
            f"https://vendor.example.com/fill-{index}", f"unrevealed {index}",
        )
    incident = contract.get_incident(incident_id)
    assert incident["evidence_capacity_used"] == incident["evidence_capacity_limit"] == "12"
    direct_vm.sender = direct_bob
    with pytest.raises(Exception, match="capacity reached"):
        contract.retry_evidence(retry_id)
    incident = contract.get_incident(incident_id)
    assert incident["evidence_capacity_used"] == "12"
    assert int(incident["evidence_count"]) == 13
    assert contract.get_stats()["accounting_balanced"] is True


def test_repeated_unavailable_retry_cycles_do_not_leak_capacity(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)
    url = "https://vendor.example.com/repeated-outage"
    fact = "Unavailable source"
    evidence_id = commit_only(direct_vm, contract, incident_id, direct_bob, "VENDOR", url, fact)
    contract.reveal_evidence(evidence_id, "VENDOR", url, fact, SALT)
    for _ in range(4):
        examine(direct_vm, contract, evidence_id, status=503)
        incident = contract.get_incident(incident_id)
        assert contract.get_evidence(evidence_id)["status"] == "SOURCE_UNAVAILABLE"
        assert incident["evidence_capacity_used"] == "0"
        assert incident["evidence_count"] == "1"  # Retry reuses this historical record.
        assert int(incident["evidence_capacity_used"]) <= int(incident["evidence_capacity_limit"])
        if _ < 3:
            direct_vm.sender = direct_bob
            contract.retry_evidence(evidence_id)
            assert contract.get_incident(incident_id)["evidence_capacity_used"] == "1"
    assert contract.get_stats()["accounting_balanced"] is True


def test_twelve_nonverified_submissions_cannot_block_valid_breach_adjudication(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie,
):
    contract = direct_deploy("contracts/faultline.py")
    _, warranty_id = setup_release_and_warranty(direct_vm, contract, direct_alice)
    coverage = 2 * 10**17
    premium = (coverage * 500 + 9999) // 10000
    direct_vm.sender = direct_charlie
    direct_vm.value = premium
    contract.buy_coverage(warranty_id, coverage)
    direct_vm.value = 0
    incident_id = open_incident(direct_vm, contract, warranty_id, direct_bob)

    failed_entries = []
    for index in range(5):
        url = f"https://vendor.example.com/unavailable-{index}"
        fact = f"Unavailable source {index}"
        failed_entries.append((commit_only(direct_vm, contract, incident_id, direct_bob, "VENDOR", url, fact), "VENDOR", url, fact))
    for index in range(5):
        url = f"https://research.example.com/invalid-{index}"
        fact = f"Unrelated source {index}"
        failed_entries.append((commit_only(direct_vm, contract, incident_id, direct_bob, "SECURITY_RESEARCH", url, fact), "SECURITY_RESEARCH", url, fact))
    for index in range(2):
        url = f"https://vendor.example.com/unrevealed-{index}"
        fact = f"Unrevealed source {index}"
        failed_entries.append((commit_only(direct_vm, contract, incident_id, direct_bob, "VENDOR", url, fact), "VENDOR", url, fact))

    for evidence_id, family, url, fact in failed_entries[:5]:
        direct_vm.sender = direct_bob
        contract.reveal_evidence(evidence_id, family, url, fact, SALT)
        examine(direct_vm, contract, evidence_id, status=503)

    # The invalid and unrevealed group remains committed at this point; reveal invalid submissions and
    # then expire the two remaining commitments after their common reveal deadline.
    for evidence_id, family, url, fact in failed_entries[5:10]:
        direct_vm.sender = direct_bob
        contract.reveal_evidence(evidence_id, family, url, fact, SALT)
        examine(direct_vm, contract, evidence_id, source_result(same_package=False, material=False))
    common_deadline = int(contract.get_evidence(failed_entries[10][0])["reveal_deadline"])
    warp(direct_vm, common_deadline)
    for evidence_id, _, _, _ in failed_entries[10:]:
        contract.expire_unrevealed_evidence(evidence_id)

    incident = contract.get_incident(incident_id)
    assert incident["evidence_count"] == "12"
    assert incident["evidence_capacity_used"] == "0"
    assert all(contract.get_evidence(evidence_id)["status"] in {"SOURCE_UNAVAILABLE", "INVALID_SOURCE", "UNREVEALED"} for evidence_id, _, _, _ in failed_entries)

    submit_verified(direct_vm, contract, incident_id, direct_bob, "VENDOR", "https://vendor.example.com/valid-a", "3.7.4 is affected")
    submit_verified(direct_vm, contract, incident_id, direct_charlie, "NVD", "https://nvd.example.com/valid-b", "3.7.4 is affected")
    incident = contract.get_incident(incident_id)
    assert incident["evidence_count"] == "14"
    assert incident["evidence_capacity_used"] == "2"
    assert incident["evidence_capacity_limit"] == "12"
    assert incident["verified_count"] == "2"
    assert incident["verified_families"] == ["VENDOR", "NVD"]
    first_page = contract.list_evidence(incident_id, 0, 12)
    second_page = contract.list_evidence(incident_id, 12, 25)
    assert first_page["total"] == "14" and len(first_page["items"]) == 12
    assert second_page["total"] == "14" and len(second_page["items"]) == 2
    assert second_page["items"][0]["status"] == "VERIFIED"

    direct_vm.sender = direct_bob
    mock_llm(direct_vm, breach_result())
    assert contract.adjudicate_incident(incident_id) == "BREACHED"
    assert direct_vm.run_validator() is True
    warranty = contract.get_warranty(warranty_id)
    assert warranty["status"] == "BREACHED"
    assert warranty["payout_reserve_atto"] == str(coverage)
    assert contract.get_stats()["accounting_balanced"] is True
