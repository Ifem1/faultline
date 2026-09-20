# Faultline

Bonded software-release warranties resolved by GenLayer consensus. Faultline registers an exact release, escrows native GEN behind frozen warranty terms, sells coverage before an incident, and adjudicates public vulnerability evidence through two-stage consensus. Settlement remains deterministic: only a finalized `BREACHED` adjudication creates a payout reserve.

## Live release

- Network: GenLayer Studionet, chain `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Canonical contract: [`0x5756f77aa6De57489132D1dB3e1D84E047559bF1`](https://explorer-studio.genlayer.com/address/0x5756f77aa6De57489132D1dB3e1D84E047559bF1), version `0.1.2-studionet`
- Deployment transaction: [`0x6faf267a55b36c21541524fa40c018e78c1a52ada65571ae5e15bacfa481bb66`](https://explorer-studio.genlayer.com/tx/0x6faf267a55b36c21541524fa40c018e78c1a52ada65571ae5e15bacfa481bb66)
- Hosted frontend: [faultline-eight-lemon.vercel.app](https://faultline-eight-lemon.vercel.app/)
- Browser wallet: generic injected EIP-1193 via `window.ethereum` only; no Snaps, WalletConnect, embedded wallet, or backend signer.

The 0.1.2 contract separates permanent evidence history from active admission capacity. `SOURCE_UNAVAILABLE`, `INVALID_SOURCE`, and `UNREVEALED` release a slot; retries reacquire one while the incident window is open. VERIFIED evidence remains capacity-consuming. Adjudication walks a bounded verified-evidence index, while history reads are paginated. The app exposes retry, unrevealed expiry, incident expiry, warranty expiry, and eligible warranty cancellation in context.

CI and release evidence are summarized in [`VERIFICATION_STATUS.md`](VERIFICATION_STATUS.md) and [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md). Current validation: GenVM lint passed; 24 Direct Mode tests; 4 Studionet integration tests; release/network hygiene, frontend typecheck/build, and hosted bundle verification. The new deployment’s source and schema match.

Earlier live lifecycle records target the superseded 0.1.1 contract and remain historical only. The new 0.1.2 deployment was verified through finalized deployment execution, schema and live stats; no new live payout was manufactured. A truthful live BREACHED outcome was not available from the prior frozen warranty evidence because public disclosures predated the warranty start. Positive reserve/claim/withdrawal behavior is covered by Direct Mode tests. See [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md) for exact scope and limitations.

## Architecture

All protocol state lives in the single Intelligent Contract `contracts/faultline.py`: release registry, funded warranties, coverage, incidents, commit/reveal evidence, source examination, warranty adjudication, reserves, pull-payment credits, expiry paths, and accounting invariant. Source examination reproduces substantive structured fields; adjudication consumes only verified evidence from distinct source families. `SOURCE_UNAVAILABLE` is a retryable non-decision, and expiry fallback `INCONCLUSIVE` is not a semantic adjudication.

The accounting invariant is exposed by `get_stats()`:

```text
total_deposited = warranty_escrow + evidence_escrow + payout_reserve + total_claimable + total_withdrawn
```

## Local checks

```bash
genvm-lint check contracts/faultline.py --json
pytest tests/direct/ -v
pytest tests/integration/ -v -s
cd frontend && npm ci && npm run typecheck && npm run build
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/SECURITY.md`](docs/SECURITY.md), [`docs/LIVE_DEMO.md`](docs/LIVE_DEMO.md), and [`AGENT_HANDOFF.md`](AGENT_HANDOFF.md).
