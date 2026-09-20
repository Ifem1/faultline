# Faultline release handoff

## Canonical release

- Network: GenLayer Studionet, chain `61999`
- RPC: `https://studio.genlayer.com/api`
- Contract/version: [`0x5756f77aa6De57489132D1dB3e1D84E047559bF1`](https://explorer-studio.genlayer.com/address/0x5756f77aa6De57489132D1dB3e1D84E047559bF1), `0.1.2-studionet`
- Deployment transaction: [`0x6faf267a55b36c21541524fa40c018e78c1a52ada65571ae5e15bacfa481bb66`](https://explorer-studio.genlayer.com/tx/0x6faf267a55b36c21541524fa40c018e78c1a52ada65571ae5e15bacfa481bb66)
- Frontend: [https://faultline-eight-lemon.vercel.app/](https://faultline-eight-lemon.vercel.app/)
- Evidence: [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md)

## Steward remediation

Permanent evidence history and current active admission capacity are separate. Terminal SOURCE_UNAVAILABLE, INVALID_SOURCE, and UNREVEALED release capacity; retry reacquires capacity only when the incident is OPEN, before deadline, and a slot is free. VERIFIED records remain capacity-consuming. Adjudication iterates a bounded verified index, and historical evidence reads are paginated. Direct Mode test `test_twelve_nonverified_submissions_cannot_block_valid_breach_adjudication` reaches BREACHED after 12 failed/unrevealed historical submissions followed by valid independent-family corroboration, and checks payout reserve/accounting.

The app exposes contextual retry, unrevealed-evidence expiry, incident expiry, warranty expiry, and eligible cancellation controls through the existing injected-wallet write path. Availability is gated by finalized contract status/deadline/ownership data.

## Verified state and constraints

GenVM lint/schema pass; 24 Direct Mode tests and 4 Studionet integration tests pass; release hygiene, frontend typecheck/build and hosted check passed in [CI run 35534583427](https://github.com/Ifem1/faultline/actions/runs/35534583427) for commit `11b07ce560fc857ba5f5c25be9b772961c5408fe`. Deployed source and schema match. The older `0x7655...` deployment is superseded and must not be described as canonical.

Keep the single Intelligent Contract, Studionet chain 61999 and exact RPC. Keep wallet support generic EIP-1193 through `window.ethereum`; add no Snaps, WalletConnect, embedded wallet, wallet-specific API, or backend signer. Preserve substantive validator replay and distinct SOURCE_UNAVAILABLE/INVALID_SOURCE/INCONCLUSIVE semantics. The known prior-cycle structured/free-text basis discrepancy remains documented; it was not a settlement vulnerability, and this release does not change the contract to address it.

Live lifecycle records from 0.1.1 remain historical. No live BREACHED payout is claimed; Direct Mode proves positive settlement. Time-gated retry/expiry/cancel methods have not been invoked on 0.1.2.
