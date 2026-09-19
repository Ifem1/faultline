# Faultline

Bonded software-release warranties resolved by GenLayer consensus.

Faultline lets a software publisher register an exact release, escrow GEN behind a narrowly defined warranty, and sell coverage against that bond before any incident can open. If a public vulnerability disclosure appears, contributors submit source evidence. GenLayer first examines each source independently, then a second consensus stage decides whether the verified evidence breaches the frozen warranty. Only a finalized `BREACHED` outcome creates a payout reserve.

## Network lock

This repository is intentionally locked to **GenLayer Studionet only**.

- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Frontend wallet: injected **EIP-1193** provider only
- No MetaMask Snaps
- No WalletConnect dependency
- No embedded wallet
- No backend signer

Do not change this repository to a preview or test network unless the project owner explicitly asks for a migration.

## Why GenLayer is doing real work

Faultline is not using an LLM as a decorative classifier. The contract controls money while different parties have opposite incentives:

- the publisher wants the warranty to survive;
- covered users want a legitimate breach paid;
- evidence contributors want their source accepted;
- no single operator should decide whether a natural-language advisory actually covers the exact release and warranty terms.

The semantic path is deliberately split inside one Intelligent Contract:

1. **Source examination consensus** fetches each submitted HTTPS source and reproduces substantive fields such as package match, affected release, qualifying severity, vulnerability class, exclusions, advisory identity and affected range.
2. **Warranty adjudication consensus** consumes only already-verified source summaries and decides `BREACHED`, `NOT_AFFECTED`, or `INCONCLUSIVE` against immutable warranty terms.
3. Deterministic settlement moves the publisher bond only after the adjudication result is accepted in contract state.

`SOURCE_UNAVAILABLE` is a retryable non-decision. `INCONCLUSIVE` moves no warranty money.

## Contract architecture

Everything lives in one contract: `contracts/faultline.py`.

The contract still has separate internal domains:

- release registry;
- funded warranty market;
- coverage accounting;
- incident lifecycle;
- commit/reveal evidence board;
- source examination consensus;
- warranty adjudication consensus;
- payout reserve and pull-credit settlement;
- bounded expiry and liveness paths;
- global accounting invariant.

The single-address architecture avoids a cross-contract trust boundary while still being non-trivial protocol architecture.

## Economic model

A publisher opens a warranty by sending a native GEN bond. Coverage holders choose a coverage notional and pay the configured premium. Total coverage can never exceed the publisher bond.

When a breach is finalized:

- `min(bond, total coverage)` becomes the payout reserve;
- any unused bond is credited back to the publisher;
- each coverage holder claims exactly their recorded coverage once;
- credits are withdrawn with a pull-payment method;
- evidence bonds are separately accounted for.

The accounting invariant is exposed in `get_stats()`:

```text
total_deposited =
    warranty_escrow
  + evidence_escrow
  + payout_reserve
  + total_claimable
  + total_withdrawn
```

## Frontend

The frontend is a multipage Next.js App Router application under `frontend/`.

Routes:

- `/` — hero landing page
- `/warranties` — finalized warranty market
- `/warranties/[id]` — bond, terms, coverage and incident history
- `/incidents` — incident ledger
- `/incidents/[id]` — evidence examination and adjudication desk
- `/open` — register release + open funded warranty
- `/account` — wallet credit and coverage positions
- `/protocol` — protocol anatomy and verdict semantics

The UI does not show mock on-chain state. Before deployment it renders a clear configuration notice; once the contract address is configured, reads use finalized contract state.

## Local setup

### Contract toolchain

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

genvm-lint check contracts/faultline.py --json
pytest tests/direct/ -v
```

For real consensus behavior on Studionet:

```bash
gltest tests/integration/ -v -s --network studionet
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run typecheck
npm run build
npm run dev
```

After deployment, set:

```text
NEXT_PUBLIC_FAULTLINE_CONTRACT=0x...
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
```

## Deploy

Use the built-in Studionet network definition:

```bash
genlayer network set studionet
genlayer network info
genlayer deploy --contract contracts/faultline.py
```

Then inspect the deployed schema before trusting frontend wiring:

```bash
genlayer schema <CONTRACT_ADDRESS>
genlayer code <CONTRACT_ADDRESS>
```

Record the finalized deployment in `docs/REVIEW_EVIDENCE.md` and wire the exact address into the frontend.

## Verification files

- `docs/ARCHITECTURE.md` — state machine, consensus boundaries and economic invariants
- `docs/SECURITY.md` — threat model and trust boundaries
- `docs/LIVE_DEMO.md` — two-wallet reviewer demo
- `docs/REVIEW_EVIDENCE.md` — deployment and test evidence checklist
- `AGENT_HANDOFF.md` — release handoff and current verified state

## Release status

- Canonical deployment: [Studionet contract `0x7655d42C17a8aE1E126af4982A901Bd121cDf221`](https://explorer-studio.genlayer.com/address/0x7655d42C17a8aE1E126af4982A901Bd121cDf221) on chain `61999`.
- Hosted frontend: [faultline-eight-lemon.vercel.app](https://faultline-eight-lemon.vercel.app/).
- CI is green. GenVM lint, release/network hygiene, frontend typecheck and production build pass; Direct Mode is **20/20**, Studionet integration is **4/4**.
- The final deployment has real funded release, warranty, coverage, incident, commit/reveal and source-examination activity. Live results include `INVALID_SOURCE`, `SOURCE_UNAVAILABLE`, `VERIFIED`, pending source callbacks, reveal expiry and deadline enforcement. Accounting remained balanced.
- No live `BREACHED` settlement or coverage payout was produced. The available public disclosure dates predate the frozen Cycle B warranty start, and only one evidence family reached `VERIFIED`; manufacturing a breach would violate the warranty terms. The positive reserve/claim path is covered by Direct Mode tests.

See [`VERIFICATION_STATUS.md`](VERIFICATION_STATUS.md) for the concise gate summary and [`docs/REVIEW_EVIDENCE.md`](docs/REVIEW_EVIDENCE.md) for deployment, transaction hashes, observed states, limitations and source-date references.
