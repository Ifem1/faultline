# Verification status — 2026-09-20

## Canonical release

Faultline 0.1.2 is deployed to GenLayer Studionet only (chain `61999`, RPC `https://studio.genlayer.com/api`). Canonical contract: [`0x5756f77aa6De57489132D1dB3e1D84E047559bF1`](https://explorer-studio.genlayer.com/address/0x5756f77aa6De57489132D1dB3e1D84E047559bF1); deployment transaction [`0x6faf267a55b36c21541524fa40c018e78c1a52ada65571ae5e15bacfa481bb66`](https://explorer-studio.genlayer.com/tx/0x6faf267a55b36c21541524fa40c018e78c1a52ada65571ae5e15bacfa481bb66). Deployed source matches repository source, and the 27-method schema matches (12 views, 15 writes). Live `get_stats` reports version `0.1.2-studionet`, Studionet/61999, exact RPC, and balanced accounting.

Hosted frontend: [faultline-eight-lemon.vercel.app](https://faultline-eight-lemon.vercel.app/), wired to the new contract and stable Studionet configuration. CI passed on release commit [`11b07ce560fc857ba5f5c25be9b772961c5408fe`](https://github.com/Ifem1/faultline/commit/11b07ce560fc857ba5f5c25be9b772961c5408fe): [run 35534583427](https://github.com/Ifem1/faultline/actions/runs/35534583427). All contract, frontend, integration, and hosted frontend jobs succeeded.

## Steward remediation

- Permanent `evidence_count` retains all historical IDs. Separate active capacity is capped at 12 and reported by `get_incident`. COMMITTED, PENDING_SOURCE, and VERIFIED occupy a slot; SOURCE_UNAVAILABLE, INVALID_SOURCE, and UNREVEALED release one exactly once.
- `retry_evidence` requires SOURCE_UNAVAILABLE, an OPEN incident, time before the evidence deadline, and available capacity; it reacquires capacity before returning to PENDING_SOURCE.
- Adjudication reads a bounded verified-evidence ID index (at most 12). `list_evidence` returns paginated history and recovery timestamps.
- The contextual app controls expose retry evidence, expire unrevealed evidence, expire incident, expire warranty, and cancel warranty under the corresponding contract eligibility conditions. Writes use the connected injected EIP-1193 wallet and require accepted/finalized consensus plus successful GenVM execution.
- Adversarial Direct Mode test `test_twelve_nonverified_submissions_cannot_block_valid_breach_adjudication` submits 12 non-verified historical records spanning SOURCE_UNAVAILABLE, INVALID_SOURCE and UNREVEALED, then submits two valid distinct-family records. Both reach VERIFIED, historical count reaches 14, adjudication reaches BREACHED, and reserve/accounting assertions pass.

## Engineering gates

- GenVM lint and schema validation: passed; 27 methods (12 views, 15 writes).
- Direct Mode: 24 tests, including the new capacity transition, retry, bounded adjudication and payout cases.
- Studionet integration: 4 read-only tests against the new canonical deployment.
- Release/network hygiene: passed; chain 61999 only.
- Frontend npm install, typecheck, production build, and hosted bundle verification: passed in the linked final CI run.
- Generic injected EIP-1193 only (`window.ethereum`).

## Historical live evidence and limits

Earlier live lifecycle transactions in [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md) target superseded contract `0x7655d42C17a8aE1E126af4982A901Bd121cDf221` (version 0.1.1). They are historical evidence, not activity on the new canonical deployment. That contract recorded SOURCE_UNAVAILABLE, INVALID_SOURCE, a VERIFIED source, unrevealed expiry, deadline rejection, and incident/warranty expiry with balanced accounting. No live adjudicated breach or payout occurred: the available disclosure dates preceded the frozen warranty start and the minimum distinct verified families was not met. The new contract deployment itself is callable and its fresh state is balanced. No extra warranty cycle was created merely to manufacture a result.

The positive BREACHED → reserve → claim path is covered by Direct Mode tests. Time-gated live retry/expiry/cancel actions were not submitted on 0.1.2; their contract semantics and UI eligibility are covered locally, while the new deployment was verified through finalized deployment execution, schema, and finalized views.
