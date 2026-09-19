# Verification status — 2026-09-19

Faultline is released on the canonical GenLayer Studionet deployment. The contract, frontend, automated checks and recorded live activity are described in [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md).

## Verified engineering state

- Canonical contract `0x7655d42C17a8aE1E126af4982A901Bd121cDf221`, chain `61999`, RPC `https://studio.genlayer.com/api`; finalized deployment and repository source/schema match verified.
- One Intelligent Contract with 27 methods (12 views, 15 writes).
- GenVM lint passed; Direct Mode tests **20/20**; Studionet integration tests **4/4**; release/network hygiene check passed.
- CI green. Frontend dependency install, typecheck, production build and hosted frontend check passed. The hosted app is [faultline-eight-lemon.vercel.app](https://faultline-eight-lemon.vercel.app/), wired to the canonical contract and exact Studionet network.
- Browser writes use generic injected EIP-1193 via `window.ethereum`.

## Live final-contract behavior

The canonical deployment has real release, funded warranty, coverage, incident and evidence state. Live final-contract observations include:

- `INVALID_SOURCE` and `SOURCE_UNAVAILABLE` evidence outcomes;
- one `VERIFIED` source with structured `publication_in_window = false`;
- unrevealed evidence expiry and bond resolution;
- a retry after the evidence deadline finalized with execution `ERROR`, as expected from deadline enforcement (finality alone is not execution success);
- incident expiry with status `EXPIRED`, `last_verdict = INCONCLUSIVE`, and zero adjudication rounds;
- warranty expiry and publisher credit withdrawal;
- balanced accounting and zero payout reserve.

Some source callbacks remain pending. The incident outcome was the expiry fallback, **not an adjudicated `INCONCLUSIVE` result**. Available GHSA and NVD publication timestamps predate the frozen Cycle B warranty start, and only one evidence family reached `VERIFIED`; no live breach or payout claim was justified. The positive `BREACHED` reserve/claim behavior remains covered by deterministic Direct Mode tests, not a live final-contract transaction.

See the evidence document for Cycle A and Cycle B transaction hashes, state readbacks, source references and known semantic-output discrepancy.
