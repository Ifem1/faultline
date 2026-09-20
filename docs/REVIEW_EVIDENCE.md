# Release evidence — Faultline 0.1.2 on Studionet

This is the authoritative release record. It distinguishes new-deployment proof from historical transactions on the superseded contract. All live calls use GenLayer Studionet (chain `61999`, RPC `https://studio.genlayer.com/api`).

## Canonical deployment

- Contract: [`0x5756f77aa6De57489132D1dB3e1D84E047559bF1`](https://explorer-studio.genlayer.com/address/0x5756f77aa6De57489132D1dB3e1D84E047559bF1), version `0.1.2-studionet`.
- Deployment transaction: [`0x6faf267a55b36c21541524fa40c018e78c1a52ada65571ae5e15bacfa481bb66`](https://explorer-studio.genlayer.com/tx/0x6faf267a55b36c21541524fa40c018e78c1a52ada65571ae5e15bacfa481bb66).
- Finality: status `7` / `FINALIZED`; execution `6` / `MAJORITY_AGREE`; leader execution `SUCCESS`, no execution error.
- Deployed source fetched with `genlayer code` matches `contracts/faultline.py` exactly after extracting the CLI source output and normalizing line endings.
- Deployed schema: 27 methods (12 views, 15 writes), matching repository source. It includes cancellation, all expiry methods, retry, and paginated `list_evidence(incident_id, offset, count)`.
- Finalized `get_stats`: version `0.1.2-studionet`, `Studionet`, chain `61999`, RPC `https://studio.genlayer.com/api`, accounting balanced. Initial counters/escrows were zero.
- The new contract was called through finalized stats, registry, and repeated stable reads. Current 4/4 read-only integration tests independently verify deployment finality, accounting, registry shape, and stable reads.
- Hosted frontend: [https://faultline-eight-lemon.vercel.app/](https://faultline-eight-lemon.vercel.app/). Production variables are configured for the new address, chain 61999, exact RPC and stable explorer. Final production deployment and public bundle verification are pending release CI.

## Steward remediation in 0.1.2

- Permanent `evidence_count` is history/indexing only. `evidence_capacity_used`, limit, and remaining are authoritative active capacity values from `get_incident`; historical `list_evidence` reads are paginated.
- COMMITTED, PENDING_SOURCE, and VERIFIED consume capacity. SOURCE_UNAVAILABLE, INVALID_SOURCE, and UNREVEALED release capacity. Transition code guards against underflow; admission and retry enforce the 12-slot ceiling.
- Retry requires SOURCE_UNAVAILABLE, OPEN incident, time before evidence deadline, and free capacity. It reacquires a slot before changing the evidence back to PENDING_SOURCE.
- `incident_verified_evidence_ids` is the bounded settlement index. `adjudicate_incident` iterates verified records only (at most 12), independent of unbounded historical failures.
- The frontend exposes contextual `retry_evidence`, `expire_unrevealed_evidence`, `expire_incident`, `expire_warranty`, and `cancel_warranty` controls with status/time/ownership eligibility checks. They use `Faultline.write`, TxRail, execution-success validation, retained failed transaction hash, and finalized refresh.

### Adversarial slot-filling proof

Direct Mode test `test_twelve_nonverified_submissions_cannot_block_valid_breach_adjudication` creates a funded warranty and incident; records 12 terminal non-verified submissions across SOURCE_UNAVAILABLE, INVALID_SOURCE, and UNREVEALED; then submits two valid sources from distinct required families and examines both to VERIFIED. Historical evidence count reaches 14 while active capacity is 2/12. Adjudication succeeds to BREACHED, creates the expected payout reserve, and checks the accounting invariant. Focused tests also cover capacity consumption at COMMITTED/PENDING/VERIFIED, each release class, retry reacquisition and full-capacity rejection, repeated unavailable/retry cycles, no leaks/overfill, and persistent history.

## Engineering checks

- `genvm-lint check contracts/faultline.py --json`: passed; schema validation passed, 27 methods (12 views/15 writes); informational I200 newer-runner notice.
- `pytest tests/direct/ -v`: **24 passed** (20 prior tests retained plus focused adversarial coverage).
- `pytest tests/integration/ -q -s`: **4 passed** against the new canonical Studionet deployment.
- `python scripts/check_release.py`: passed, Studionet 61999 only and one contract.
- Frontend: `npm ci`, `npm run typecheck`, and `npm run build` passed locally.
- GitHub CI and hosted frontend check: pending the final pushed commit and Vercel production deployment.

## Historical live activity — superseded contract only

All transaction records below refer to version `0.1.1-studionet` at [`0x7655d42C17a8aE1E126af4982A901Bd121cDf221`](https://explorer-studio.genlayer.com/address/0x7655d42C17a8aE1E126af4982A901Bd121cDf221). This address is superseded and is not canonical. These records are preserved for audit context; none describe activity on the 0.1.2 deployment.

- Old deployment transaction: [`0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f`](https://explorer-studio.genlayer.com/tx/0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f).
- Cycle A release `fl-rel-2`: [`0x91a9fe798d1df6fd679d46d1dc38bf1c3b248c57122213a932ca75dbe4bdd67b`](https://explorer-studio.genlayer.com/tx/0x91a9fe798d1df6fd679d46d1dc38bf1c3b248c57122213a932ca75dbe4bdd67b). Warranty `fl-war-3` with 1 GEN bond: [`0x1563d7c82c24cdb2fbd322e4e5fbef25c9589af844c4ea878a963a3e56f58af0`](https://explorer-studio.genlayer.com/tx/0x1563d7c82c24cdb2fbd322e4e5fbef25c9589af844c4ea878a963a3e56f58af0). Coverage purchase: [`0xa570dbafd4592e6b7eef405906d92689a061801a80a2d9ed0a05de356438c58c`](https://explorer-studio.genlayer.com/tx/0xa570dbafd4592e6b7eef405906d92689a061801a80a2d9ed0a05de356438c58c). Incident `fl-inc-1`: [`0xf82467ed27b69a8264e7a8fad33f75c87481a147597aa04239d08385b8043920`](https://explorer-studio.genlayer.com/tx/0xf82467ed27b69a8264e7a8fad33f75c87481a147597aa04239d08385b8043920).
- Cycle A evidence included SOURCE_UNAVAILABLE and INVALID_SOURCE outcomes and pending callbacks; it did not meet the two-family verified threshold and was not adjudicated. Full hashes for the already recorded evidence transactions remain in the superseded release archive/previous revision.
- Cycle B release `fl-rel-3`: [`0x1e4f7ccddf87ecf2847873d7c872c10c19a26426388f27b725d9e805ea6eb1a7`](https://explorer-studio.genlayer.com/tx/0x1e4f7ccddf87ecf2847873d7c872c10c19a26426388f27b725d9e805ea6eb1a7). Warranty `fl-war-4`: [`0xea08f1d98fde6b84ec48d05f031a27db7c7d0c36046d2d31d7c812b8a402e100`](https://explorer-studio.genlayer.com/tx/0xea08f1d98fde6b84ec48d05f031a27db7c7d0c36046d2d31d7c812b8a402e100). Wallet C coverage: [`0x5ef496d2b50d483e23a44d948a2773be46a7fe3964d70a7f31720c5b8fb8f3d7`](https://explorer-studio.genlayer.com/tx/0x5ef496d2b50d483e23a44d948a2773be46a7fe3964d70a7f31720c5b8fb8f3d7). Incident `fl-inc-2`: [`0x1cbe58abd39f5048eb77a60a7e387e7fd2c52edcd07298dc951fbaaff0d6d252`](https://explorer-studio.genlayer.com/tx/0x1cbe58abd39f5048eb77a60a7e387e7fd2c52edcd07298dc951fbaaff0d6d252).

### Cycle B evidence, deadlines and expiry

| Evidence | Source | Commit transaction | Reveal transaction | Observed result |
| --- | --- | --- | --- | --- |
| fl-ev-10 | GITHUB_ADVISORY | `0x32d06b0a591f49064564f848d88dd7674c50ffb1d213825c460ef64785c8e119` | `0xde08fe372ef7d844d29696e577300203057bc4976abe21a8b01d20d0e189d879` | SOURCE_UNAVAILABLE |
| fl-ev-11 | NVD | `0x75076db9688e306f24fe4e76b926c384b9ee62226d7b81c81aeade5e8a63bd9e` | `0x28b27376b81f0cbb53b4d501b24e4c920415ecfbd642aaf7e16003a85e3c4bb1` | PENDING_SOURCE at last observation |
| fl-ev-12 | reveal salt unavailable | `0x82978b212dd66e9905f77c98edfe58ad034cfd3f88a603f0e58cf2abc1e48624` | no reveal; UNREVEALED | bond resolution `0xdb182098eefd145d42e5277d1ec65a27683fabd6727fa9de6ddc288ebb03906e` |
| fl-ev-13 | SECURITY_RESEARCH / VulnCheck | `0xf10f4cff303ea93c85040ce93122998e24abc5901f5d80ad692137620147e9cd` | `0x1c434b2031513ef9ae9a495da75a036e268c43eb2a394cb8b4edca9bbfafb6ec` | VERIFIED; structured publication_in_window=false |
| fl-ev-14 | vendor raw source | `0xa8fd0068df8b75c0bebfaa7726cf7d49f556e035c2f0dbee489ebdaf775bfc54` | `0xbd9f7d6f134f6a3e14385387e028026197028b984529e09d3af48a1425142fc7` | PENDING_SOURCE at last observation |
| fl-ev-15 | vendor via jsDelivr | `0x613f78462ed8ce8fd73364cb88cc86b2ac2a0b5da71b5d9bdaf2943f8d5dccd5` | `0xbc93f143a7b41121761004d309ca9b57a879bb5d83aa5d91e0802ca8648a87c5` | PENDING_SOURCE at last observation |

- Retry after the evidence deadline: `0x19561010843c0033fcf75b7fbaaa846b8cddbbf99b2f00d48ff017615067b1c2`; finalized but execution ERROR as expected because retry is disallowed after the deadline. This demonstrates FINALIZED is not execution success.
- Incident expiry: `0xd1d79c6aa6b017866d73fb36c499d294ded04f31d63e6ae0173871afbb2f3876`. Final status EXPIRED, `last_verdict=INCONCLUSIVE`, adjudication rounds 0. This was liveness expiry, not semantic adjudication.
- Warranty expiry: `0x2f94f3df8d3035cd2a8eb4095306bfc4e912e20e2bcbf320073fc5415e60ba59`; publisher credit withdrawal: `0xdc6228fbec49482c3928f7aa92deb1e2f72b08d5af224e7289f8ab07e32f3659`. No payout reserve or coverage claim occurred.
- Final old-contract observed accounting: balanced=true, payout reserve 0, evidence escrow `600000000000000` atto, claimable `200000000000000` atto. Some callbacks remained pending.

Public GHSA [GHSA-8c2m-33v9-vvqm](https://github.com/siyuan-note/siyuan/security/advisories/GHSA-8c2m-33v9-vvqm) was published September 18, 2026. NVD [CVE-2026-93922](https://nvd.nist.gov/vuln/detail/CVE-2026-93922) records 2026-09-19 00:16 UTC. The frozen Cycle B warranty began around 2026-09-19 15:22 UTC, so those disclosures predate its start and cannot truthfully support an in-window breach.

### Known source-basis discrepancy on superseded contract

For old-contract `fl-ev-13`, structured `publication_in_window=false` was correct, but free-text `basis` reportedly used incorrect August warranty dates. No adjudication ran and no funds moved due to that text. This is a semantic-output quality limitation: future judging/UI should explicitly prioritize structured fields when explanatory text conflicts. It is not an observed settlement vulnerability; no 0.1.2 contract change was made for it.

## What was not demonstrated live

- The 0.1.2 deployment has no live warranty/evidence cycle; its initial state is empty. Deployment finality, execution success, source/schema identity, live calls, stable reads and balanced accounting are verified.
- New 0.1.2 retry, unrevealed expiry, incident expiry, warranty expiry or cancellation transactions have not been submitted live. The contextual controls and eligibility rules are implemented; time-dependent paths are contract-tested in Direct Mode.
- Neither prior live cycle reached semantic adjudication. There was no live BREACHED/NOT_AFFECTED adjudication, reserve, coverage claim, or payout withdrawal. Positive BREACHED settlement is proven by Direct Mode adversarial test, not a live transfer.
- Prior Cycle B INCONCLUSIVE was generated by expiry with zero adjudication rounds, not by semantic adjudication.
- Live browser-wallet production writes have not been separately exercised.
