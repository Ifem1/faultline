# Faultline release handoff

Faultline’s Studionet release and required engineering gates are complete. This handoff supersedes the original build-and-deploy checklist below; that checklist described work before the canonical deployment and live lifecycle evidence existed.

## Canonical release

- Network: GenLayer Studionet, chain `61999`
- RPC: `https://studio.genlayer.com/api`
- Contract: `0x7655d42C17a8aE1E126af4982A901Bd121cDf221`
- Deployment transaction: `0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f`
- Frontend: [https://faultline-eight-lemon.vercel.app/](https://faultline-eight-lemon.vercel.app/)
- Full evidence: [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md)

## Verified state

CI is green. GenVM lint, the 20 Direct Mode tests, 4 Studionet integration tests, release/network hygiene, frontend typecheck, production build and hosted frontend check passed. The canonical source and deployed schema match. Live final-contract activity and its limits are documented in the evidence file.

No live `BREACHED` adjudication or payout was produced. Cycle B had one verified source family, and the relevant public disclosure dates preceded the frozen warranty start. Incident expiry set `last_verdict = INCONCLUSIVE` with zero adjudication rounds; it was not a semantic adjudication. The successful reserve/claim path is covered by Direct Mode tests.

## Maintenance constraints

- Keep the application on Studionet chain `61999` and the exact RPC above unless the owner explicitly authorizes migration.
- Keep Faultline as one Intelligent Contract in `contracts/faultline.py`.
- Keep browser wallet access generic injected EIP-1193 through `window.ethereum`; do not add a backend signer, embedded wallet, WalletConnect, Snaps or wallet-specific extension APIs.
- Preserve validator replay and the distinctions among `SOURCE_UNAVAILABLE`, `INVALID_SOURCE`, pending evidence and adjudication verdicts. `SOURCE_UNAVAILABLE` is a retryable non-decision; expiry fallback `INCONCLUSIVE` must not be presented as an adjudication.
- The live structured/free-text discrepancy for `fl-ev-13` is documented as a future semantic-output hardening item. Do not change the deployed contract to address it in this release.

This handoff is documentation only. The canonical deployment remains in place; no further demo cycle or redeployment is required for this release record.
