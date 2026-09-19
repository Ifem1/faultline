# Faultline architecture

## Trust model

Faultline is a software-release warranty protocol, not a generic truth oracle.

A publisher commits capital to one exact release and one immutable warranty. Coverage is sold before incidents can open. Once a qualifying disclosure appears, public evidence is submitted and GenLayer consensus resolves the semantic link between:

1. the frozen release;
2. the frozen warranty;
3. public security sources;
4. affected-version language;
5. severity and vulnerability-class language;
6. exclusions;
7. the economic settlement.

No publisher, claimant, frontend operator or centralized API gets a privileged settlement role.

## One-contract layout

`Faultline(gl.Contract)` owns all state. The single deployment intentionally avoids a cross-contract authorization and schema-compatibility boundary.

Internal domains:

```text
release registry
    ↓
funded warranty + coverage ledger
    ↓
incident state machine
    ↓
commit/reveal evidence board
    ↓
source examination consensus
    ↓
verified evidence set
    ↓
warranty adjudication consensus
    ↓
deterministic payout reserve
    ↓
pull-credit withdrawal
```

## Release registry

A release binds:

- ecosystem;
- package/project name;
- exact version;
- SHA-256 release fingerprint;
- canonical HTTPS metadata URL;
- publisher address.

Only the registered publisher may open a warranty for the release.

## Warranty

The publisher deposits native GEN and freezes:

- warranty title;
- severity rule;
- vulnerability class;
- exclusions;
- premium rate;
- coverage close time;
- warranty end time;
- incident evidence window;
- minimum verified source count;
- minimum distinct source-family count;
- evidence submission bond.

Coverage cannot exceed the publisher bond. New coverage is blocked after the coverage window closes and while an incident is active.

## Incident lifecycle

Only one incident can be active per warranty. An incident can open only after coverage has closed and before the warranty end.

```text
OPEN
 ├─ enough verified evidence → adjudication
 │    ├─ BREACHED      → warranty closes + payout reserve
 │    ├─ NOT_AFFECTED  → incident closes, warranty remains open
 │    └─ INCONCLUSIVE  → incident remains open
 └─ evidence deadline passes → EXPIRED
```

`INCONCLUSIVE` is a first-class non-decision.

## Commit/reveal evidence

Each evidence submission is bound to:

- chain ID `61999`;
- contract address;
- incident ID;
- submitter address;
- source family;
- HTTPS URL;
- claimed fact;
- random 32-byte salt.

The commitment is SHA-256 over a deterministic length-prefixed encoding. This prevents a visible URL from being copied into a competing submission before the original commitment is anchored.

Exact duplicate source URLs are rejected per incident.

## Source examination consensus

The contract fetches the source itself. The LLM is asked for typed fields:

- `source_available`
- `family_matches`
- `same_package`
- `material`
- `publication_in_window`
- `version_discussed`
- `release_affected`
- `severity_qualifies`
- `class_matches`
- `exclusion_applies`
- `advisory_id`
- `affected_range`
- `basis`

Leader and validators independently rerun the same examination. Validation compares all substantive fields except free-form `basis`.

Outcomes:

- source unavailable → `SOURCE_UNAVAILABLE`, bond returned, retry allowed;
- wrong family / wrong package / immaterial → `INVALID_SOURCE`, bond credited to publisher;
- substantive source → `VERIFIED`, bond returned and source can enter adjudication.

An LLM-format failure is not silently converted into a source judgment; typed normalization raises an explicit `LLM_ERROR`.

## Warranty adjudication consensus

Only verified sources are included. Before an adjudication can run, deterministic checks require:

- minimum verified source count;
- minimum distinct declared-and-verified source families.

The second consensus stage returns:

- `affected_release`
- `disclosure_in_window`
- `severity_qualifies`
- `class_matches`
- `exclusion_applies`
- `evidence_consistent`
- `verdict`
- `basis`

A `BREACHED` verdict is accepted only when the typed fields are internally coherent: exact release affected, disclosure is inside the warranty window, severity qualifies, class matches, exclusion does not apply, evidence consistent.

`NOT_AFFECTED` requires consistent evidence and at least one required warranty condition to be false.

Conflicting or incomplete verified evidence must return `INCONCLUSIVE`.

## Settlement

On breach:

```text
payout = min(publisher bond, total coverage)
publisher refund = bond - payout
```

The contract moves the payout into a dedicated reserve. Coverage holders then call `claim_breach_payout`, which converts their recorded notional into claimable credit exactly once.

All external value transfers use pull-credit withdrawal. A helper can trigger withdrawal for a recipient but cannot redirect the payment.

## Accounting invariant

At all times:

```text
total_deposited ==
  warranty_escrow
+ evidence_escrow
+ payout_reserve
+ total_claimable
+ total_withdrawn
```

`get_stats()` exposes the invariant for reviewers and tests.
