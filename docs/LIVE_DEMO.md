# Live reviewer guide — Faultline 0.1.2

The production frontend is [faultline-eight-lemon.vercel.app](https://faultline-eight-lemon.vercel.app/). It connects through generic injected EIP-1193 (`window.ethereum`) to the canonical Studionet contract [`0x5756f77aa6De57489132D1dB3e1D84E047559bF1`](https://explorer-studio.genlayer.com/address/0x5756f77aa6De57489132D1dB3e1D84E047559bF1), chain `61999`, RPC `https://studio.genlayer.com/api`.

## Reviewer path

1. Browse `/warranties` and `/incidents`, then open detail pages to inspect finalized state.
2. On an incident detail, compare historical submissions with active capacity. A retry appears only for SOURCE_UNAVAILABLE while the incident is OPEN, before its evidence deadline, and with free capacity. A committed item past its reveal deadline can be expired. An OPEN incident after its evidence deadline can be expired through the liveness fallback, which sets EXPIRED/INCONCLUSIVE without semantic adjudication.
3. On a warranty detail, the publisher can cancel an OPEN warranty only when coverage is zero and no active incident exists. An OPEN warranty can be expired after its end time if no active incident remains.
4. Writes use the connected injected wallet and existing transaction rail. The app considers a write successful only when consensus is accepted/finalized and GenVM execution succeeds.
5. See [`REVIEW_EVIDENCE.md`](REVIEW_EVIDENCE.md) for deployment proof, live readback, tests, and the explicit boundaries of prior live transactions.

## Steward capacity remediation

`evidence_count` is the permanent historical submission count; `evidence_capacity_used`, limit, and remaining are separate finalized contract reads. COMMITTED, PENDING_SOURCE, and VERIFIED consume a slot. SOURCE_UNAVAILABLE, INVALID_SOURCE, and UNREVEALED release it. A retry reacquires capacity and fails cleanly if all 12 slots are occupied. Adjudication walks only the bounded verified-ID set; historical browsing is paginated.

The adversarial Direct Mode test `test_twelve_nonverified_submissions_cannot_block_valid_breach_adjudication` fills 12 historical slots with unavailable, invalid and unrevealed outcomes, then verifies two distinct-family sources, adjudicates BREACHED, and checks the payout reserve and accounting invariant.

## Live evidence already recorded

Cycle A and Cycle B transactions in the evidence file target the former 0.1.1 deployment `0x7655d42C17a8aE1E126af4982A901Bd121cDf221`. They are historical and do not describe state on the current 0.1.2 contract. Those cycles proved real funded lifecycle operations and non-breach outcomes, but no live adjudication or coverage payout. Available Cycle B disclosures predated its frozen warranty start, so a BREACHED claim would have been untruthful.

The 0.1.2 contract is newly deployed and has been verified by finalized deployment execution, matching source/schema, callable finalized reads and balanced fresh accounting. No new demo cycle was created to manufacture live evidence. The positive BREACHED → reserve → claim → withdrawal path is proven in Direct Mode, not claimed as live. Time-gated 0.1.2 retry/expiry/cancel writes have not yet been invoked live.
