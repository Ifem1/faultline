# Faultline finishing goal

This repository is already a substantial implementation. Your job is to take it from the attached archive to a genuinely verified, deployed, live Studionet release.

This is an **execution goal**, not a review request. Do not stop after explaining what should be done.

## Hard network lock

Use only:

```text
GenLayer Studionet
chain ID: 61999
RPC: https://studio.genlayer.com/api
explorer: https://explorer-studio.genlayer.com
```

Do not deploy to or configure any other GenLayer environment. Do not change the app to a preview network.

## Wallet rule

The browser wallet path must remain generic injected **EIP-1193** through `window.ethereum`.

Do not add:

- MetaMask Snaps;
- `wallet_getSnaps`;
- WalletConnect;
- Privy or another embedded wallet;
- a backend signer;
- a private key in frontend code.

The current implementation intentionally has none of those.

## Product that must be preserved

Faultline is a bonded software-release warranty protocol.

A publisher:

1. registers an exact release;
2. deposits GEN behind immutable warranty terms;
3. sells coverage before the coverage window closes.

After coverage closes, an incident can open. Evidence contributors commit and reveal public HTTPS sources. GenLayer runs two distinct semantic consensus stages inside one Intelligent Contract:

1. **source examination** — fetch and classify each source;
2. **warranty adjudication** — apply only verified source summaries to the frozen warranty.

The only adjudication verdicts are:

```text
BREACHED
NOT_AFFECTED
INCONCLUSIVE
```

`SOURCE_UNAVAILABLE` is a retryable evidence non-decision. It must never silently become `NOT_AFFECTED`, `INVALID_SOURCE`, or `BREACHED`.

A finalized breach converts the publisher bond into a deterministic payout reserve. LLM output must never determine transfer amounts or recipient addresses.

Do not simplify this into a generic AI classifier or a normal escrow contract.

## Contract architecture

The project deliberately uses **one large Intelligent Contract**:

```text
contracts/faultline.py
```

Keep it one contract unless the current GenLayer runtime makes some specific feature impossible. A long contract is acceptable. Architectural depth comes from its internal state machines, two nondeterministic consensus stages, evidence semantics, economics, liveness and accounting.

Do not split it merely to look more complex.

## First: install and verify current GenLayer context

Use the official GenLayer development context before changing GenLayer-specific code.

For Claude Code when available:

```text
/plugin marketplace add genlayerlabs/skills
/plugin install genlayer-dev@genlayerlabs
```

Use the `write-contract`, `genvm-lint`, `direct-tests`, `integration-tests`, and `genlayer-cli` skills as appropriate.

If MCP is supported:

```bash
claude mcp add genlayer-docs --transport sse https://docs-mcp.genlayer.com/sse
claude mcp add genlayer npx -- -y genlayer-mcp
```

If MCP is not available, use the official GenLayer documentation and SDK references. Do not guess a changed API.

## Required execution order

### 1. Inspect before editing

Read:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/LIVE_DEMO.md`
- `docs/REVIEW_EVIDENCE.md`
- `contracts/faultline.py`
- all direct tests
- all frontend GenLayer integration files

Understand the accounting invariant and verdict semantics before touching state logic.

### 2. Install the Python toolchain

Use an isolated environment and install the pinned dependencies. If the official stable Studionet toolchain has moved beyond these pins, update the pins only after confirming compatibility with current official docs.

Run:

```bash
genvm-lint check contracts/faultline.py --json
```

Fix **every actual linter error**. Do not silence or delete protocol logic to make lint pass.

Pay particular attention to:

- GenLayer storage-safe dataclasses;
- TreeMap/DynArray usage;
- local temporary Python containers vs persisted storage;
- nondeterministic execution boundaries;
- web response body handling;
- `emit(on="finalized")` callback semantics;
- native transfer interface;
- use of `gl.message_raw["datetime"]` on the installed runtime;
- any SDK/runtime signature that changed since the initial implementation.

Re-run lint after every contract change.

### 3. Run the direct tests

```bash
pytest tests/direct/ -v
```

Expand or adapt tests where necessary so the final suite proves at least:

- release uniqueness;
- only release publisher can warrant it;
- warranty is actually funded;
- exact premium accounting;
- coverage cannot exceed bond;
- coverage pauses/closes correctly;
- incident cannot open before coverage close;
- only one active incident per warranty;
- commitment binds chain, contract, incident, wallet, family, URL, claimed fact and salt;
- duplicate URLs are rejected per incident;
- unrevealed evidence expires safely;
- source unavailable is retryable and returns its bond;
- invalid source does not increment verified count;
- source validator independently reproduces substantive fields;
- malformed LLM output never becomes a financial decision;
- minimum verified-source threshold is enforced;
- minimum distinct source-family threshold is enforced;
- warranty judge independently reproduces all substantive decision fields;
- `INCONCLUSIVE` leaves the warranty bond untouched;
- `NOT_AFFECTED` closes only the incident;
- `BREACHED` closes the warranty and moves exactly the correct amount into payout reserve;
- a holder cannot claim more than once;
- warranty expiry returns the bond when appropriate;
- active incident blocks unsafe warranty expiry;
- pull credit cannot be redirected;
- accounting remains balanced after every economic path.

If the current test harness exposes child `emit(on="finalized")` execution differently from the initial tests, adapt the tests to the real runtime rather than removing staged execution.

### 4. Verify the frontend against the installed stable SDK

The frontend is Next.js App Router and must remain multipage.

Run:

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

Fix all errors.

Inspect current official `genlayer-js` docs and make sure the browser path uses the stable `studionet` chain object and an injected EIP-1193 provider.

The important current integration intent is:

```text
read client: no signing account
write client: exact connected wallet address + window.ethereum provider
network: studionet / 61999
```

Verify, do not assume, the exact current methods for:

- fee estimation;
- `writeContract`;
- `waitForDecision`;
- `waitForFinalization`;
- finalized `readContract` state.

If the stable SDK has a slightly different lifecycle API, update the frontend while preserving the UX distinction between signing, submitted, decided and finalized.

### 5. Preserve the UI identity

Do not replace the frontend with a generic template.

Preserve the current visual direction:

- bone/paper canvas;
- hard black structural rules;
- acid chartreuse;
- cobalt and ember accents;
- typographic editorial layout;
- fault-trace visual language;
- no purple AI gradients;
- no glassmorphism dashboard clone;
- no generic three-card SaaS hero;
- no stock AI art;
- no filler copy.

Improve responsive behavior or accessibility when needed, but keep it recognizably Faultline.

### 6. Verify commitment flow in the real UI

The incident page currently:

1. creates a random 32-byte salt;
2. calls the contract view to compute the exact commitment;
3. stores reveal material locally under that commitment;
4. submits the evidence commitment with the exact evidence bond;
5. after finality, finds the committed evidence record;
6. reveals the source;
7. waits for the contract's finalized child source-examination callback.

Make this recovery-safe.

If the browser closes after the commit but before reveal, the locally saved reveal material must still be usable. Add a visible recovery/reveal UI if necessary rather than silently discarding the commitment.

Never automatically submit a second commit because a transaction response was ambiguous.

### 7. Run real consensus/integration tests on Studionet

Use only Studionet:

```bash
gltest tests/integration/ -v -s --network studionet
```

The included smoke file is intentionally minimal because this archive could not know the exact installed live deployment in advance. Replace/expand it into a real integration suite after deployment.

At minimum prove on the real network:

- live source fetch works;
- source-examination consensus completes;
- validator semantics match the stored result;
- emitted finalized callback works;
- a second adjudication consensus works over verified evidence;
- payable writes accept native test GEN;
- `emit_transfer`/withdrawal works on Studionet;
- transaction finality can be observed from the frontend SDK.

### 8. Deploy the final contract

Use the built-in network definition:

```bash
genlayer network set studionet
genlayer network info
```

Confirm it resolves to chain `61999` and `https://studio.genlayer.com/api`.

Then deploy:

```bash
genlayer deploy --contract contracts/faultline.py
```

Wait for finality.

Inspect:

```bash
genlayer schema <ADDRESS>
genlayer code <ADDRESS>
```

Confirm the deployed source and method schema correspond to the final repository source.

Record the exact contract address and deployment transaction in `docs/REVIEW_EVIDENCE.md`.

### 9. Wire the exact deployment into the frontend

Set:

```text
NEXT_PUBLIC_FAULTLINE_CONTRACT=<FINALIZED_ADDRESS>
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
```

There must be no fallback address from another deployment.

The production app must not present unfinalized protocol state as durable warranty state.

### 10. Execute the complete live demo

Follow `docs/LIVE_DEMO.md` with real Studionet accounts and real test GEN.

Do not use fake frontend state or manually edit protocol records.

Capture:

- deployment transaction;
- release registration;
- funded warranty;
- coverage purchase;
- incident creation;
- invalid-source path;
- `SOURCE_UNAVAILABLE` path if a controlled reproducible endpoint is available;
- two verified source families;
- breach adjudication;
- payout claim;
- withdrawal;
- one NOT_AFFECTED path;
- one INCONCLUSIVE path when practical.

Record explorer hashes and final state in `docs/REVIEW_EVIDENCE.md`.

### 11. Final review

Before stopping, confirm:

```bash
genvm-lint check contracts/faultline.py --json
pytest tests/direct/ -v
gltest tests/integration/ -v -s --network studionet
cd frontend && npm run typecheck && npm run build
```

Then run the repository release checker and search the repository for accidental alternate-network references.

## Do not do these things

- Do not switch to another GenLayer chain.
- Do not split the contract merely for scoring optics.
- Do not remove substantive validator replay.
- Do not change `SOURCE_UNAVAILABLE` into a rejection.
- Do not let `INCONCLUSIVE` move warranty funds.
- Do not let the frontend simulate successful contract writes.
- Do not hardcode demo data as if it were on-chain state.
- Do not introduce an operator/admin settlement backdoor.
- Do not add a backend that decides the verdict.
- Do not store private keys.
- Do not call it insurance unless the legal/regulatory framing has actually been addressed; the product language is a bonded software warranty market/protocol.

## Definition of done

The goal is complete only when all of the following are true:

1. final contract passes the actual GenVM linter;
2. direct tests pass;
3. real Studionet consensus paths have been exercised;
4. one final contract is deployed and finalized on chain 61999;
5. frontend is wired to exactly that address;
6. injected EIP-1193 wallet writes work without Snaps;
7. the multipage production build passes;
8. live source examination is real;
9. live warranty adjudication is real;
10. native value and pull-withdrawal paths are proven;
11. explorer evidence is recorded;
12. `docs/REVIEW_EVIDENCE.md` is complete and truthful;
13. no unresolved TODO is required for the main user flow;
14. the repository is left clean, understandable, and ready to submit.

Do not finish by giving recommendations. Finish by leaving the working result.
