# Live reviewer guide

Faultline is deployed at [https://faultline-eight-lemon.vercel.app/](https://faultline-eight-lemon.vercel.app/) and uses the canonical contract [`0x7655d42C17a8aE1E126af4982A901Bd121cDf221`](https://explorer-studio.genlayer.com/address/0x7655d42C17a8aE1E126af4982A901Bd121cDf221) on GenLayer Studionet (chain `61999`). The documented live cycles are historical and already recorded; this guide does not ask reviewers to create another warranty or imply a live breach occurred.

## Reviewer path

1. Open the hosted app with an injected EIP-1193 wallet configured for Studionet. The frontend uses `window.ethereum` only.
2. Browse `/warranties`, `/incidents` and their detail routes to inspect finalized canonical contract state. `/protocol` explains the evidence and verdict semantics.
3. Compare the release, funded warranty, coverage, incident and evidence records against the transaction hashes and final reads in [`REVIEW_EVIDENCE.md`](REVIEW_EVIDENCE.md).
4. Inspect deployment, release and lifecycle transactions through the linked Studionet explorer entries.
5. Treat current source callbacks marked pending as pending. Do not infer that an attempted evidence submission is a verified source or adjudication.

## Live evidence already recorded

Two evidence cycles were attempted against the final contract. They demonstrated funded warranty and coverage activity, incident creation, commit/reveal, live `INVALID_SOURCE`, `SOURCE_UNAVAILABLE` and `VERIFIED` examination outcomes, unrevealed-bond resolution, deadline rejection, incident and warranty expiry, publisher credit withdrawal, and balanced accounting. Full transaction-by-transaction records are in [`REVIEW_EVIDENCE.md`](REVIEW_EVIDENCE.md).

Cycle B did not reach adjudication: the contract requires two independent verified source families and only one reached `VERIFIED`. Its incident expired through the liveness fallback, leaving status `EXPIRED`, `last_verdict = INCONCLUSIVE`, and zero adjudication rounds. This was not an adjudicated `INCONCLUSIVE` verdict.

## Expected positive settlement path

The contract’s positive settlement behavior is covered by Direct Mode tests, not by a live final-contract payout transaction. When an adjudication truthfully returns `BREACHED`, deterministic settlement reserves the covered amount from the warranty bond; each eligible coverage holder claims once; claimable credit is withdrawn to its credited recipient. See the test and protocol descriptions in the repository. Do not describe this expected/tested path as a live demonstration.

## What happened in the real Studionet cycles

For Cycle B, the GHSA publication date was September 18, 2026 and the NVD publication timestamp was September 19 at 00:16 UTC; the warranty began around September 19 at 15:22 UTC. Those disclosures predate the frozen coverage period. The one verified source also had structured `publication_in_window = false`. The protocol therefore had no truthful basis for a live breach. No dates or validation rules were altered, no payout reserve was created, and no coverage claim was made. See the source links and known free-text basis discrepancy in [`REVIEW_EVIDENCE.md`](REVIEW_EVIDENCE.md).
