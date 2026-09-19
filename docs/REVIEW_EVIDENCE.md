# Release evidence — Studionet

This file records verified checks and live transactions. The successful warranty/bond/coverage lifecycle and payout demo is **not complete**; live source publication dates did not support a truthful BREACHED result within the demo warranty window. See the explicit limitations below.

## Network and source quality

- `genlayer network info`: Studionet, chain `61999`, RPC `https://studio.genlayer.com/api`.
- Only one Intelligent Contract: `contracts/faultline.py`.
- `genvm-lint check contracts/faultline.py --json`: passed; 27 methods (12 views, 15 writes); informational I200 runner update notice only.
- `pytest tests/direct/ -v`: **20 passed**.
- `gltest tests/integration/ -v -s --network studionet` with `FAULTLINE_CONTRACT` set: **1 passed**. This is configuration smoke coverage, not an end-to-end consensus test.
- `cd frontend && npm run typecheck && npm run build`: both passed using Next.js 16.3.5.
- `genlayer schema 0x7655d42C17a8aE1E126af4982A901Bd121cDf221`: 27 methods, matching the source API.
- `genlayer code` output compared with `contracts/faultline.py`: exact source match after extracting the CLI's returned source (line endings normalized).
- `genlayer call ... get_stats`: version `0.1.1-studionet`, Studionet/61999, required RPC, balanced accounting.
- `genlayer call ... compute_evidence_commitment --args ...`: succeeded against the corrected deployment, exercising an address argument.

## Final deployment

- Contract: [`0x7655d42C17a8aE1E126af4982A901Bd121cDf221`](https://explorer-studio.genlayer.com/address/0x7655d42C17a8aE1E126af4982A901Bd121cDf221)
- Transaction: [`0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f`](https://explorer-studio.genlayer.com/tx/0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f)
- Receipt: status `7`, `FINALIZED`, deployment execution `SUCCESS`.
- The first deployment (`0xd8EFA86FF1377EdE221b5CF3e8106E900aD46B1c`, transaction `0xdff27efdc69ca504e84d70acd29862b63436ce140201d10f9a024c7f00a31781`) is superseded. The address normalization bug found during its live exercise was fixed in repository source and redeployed as version 0.1.1. Do not use the first address.
- Frontend `.env.example` and local `.env.local` use the final address, RPC, chain and Studionet explorer.

## Tests and application

- `frontend/src/lib/genlayer/client.ts` fails closed unless the selected chain is 61999 and the RPC is exactly `https://studio.genlayer.com/api`; wallet transport remains generic injected EIP-1193 (`window.ethereum`).
- Production typecheck and build pass. No public hosted frontend URL was created as part of this run.
- Live frontend write flows through the injected browser wallet were not exercised.

## Live two-wallet activity on the superseded deployment

These transactions are real and finalized on Studionet, but they target the superseded first contract. They are useful audit evidence only and do **not** establish successful flows on the final deployment.

- Publisher `faultline-demo-publisher`: `0x863feac311f95c2c05aaf52e379ef5ab8663b302`.
- Coverage/evidence holder `faultline-demo-holder`: `0x2f283983536a6c2bdd508a7987e064826f167f96`.
- Funding (publisher): `0x539a7aee604353a74b447e64d92f6ca3c852d6a9abe3341d73e8f95617cd26c2`.
- Funding (holder): `0xc1560d660618174460ed1875ec42422bf5006b1319719028e0f48534f7904170`.
- Release registration `fl-rel-1`: `0x1674b8d3d259d43d3bc62e2d19919b5dd4a46bae75b3b43ba79e10ac2bea8f2f`.
- Warranty `fl-war-1` with a 2 GEN publisher bond: `0xc0cb1afc71e8a786346569513f2c1c706035594ebdf479994bfcbb0e6dd90268`.
- Holder bought 0.5 GEN coverage for 0.025 GEN premium: `0xa1f500983758c1b9579c7757e19768e026cf2ea200c596e8ee1ce3a57ed641d0`.
- Incident `fl-inc-1`: `0x5e1fd524a95deda776b28c7db9d30d80872bc1bf3134b923bd704c73a9460fab`.
- Commit evidence: `0xe4fe5b4979a80cbb4ed50c979194f3a1a1068a45f74934bc2030c50e0c068bda`; reveal: `0xc8da02d70049b8768598d182e7cc25e1ff60c6aac8da8361c3dd18752152e10a`; result `INVALID_SOURCE`.
- The source examination fetched the public CISA About page, whose contents do not establish the Cisco release/CVE. It correctly returned `INVALID_SOURCE` and did not count verified evidence.
- The fixed address helper `compute_evidence_commitment` was tested successfully on the final deployment using a view call; this did not submit evidence or alter state.

## Missing proof and constraints

- No successful live `SOURCE_UNAVAILABLE` case was finalized.
- No two independently verified source families were adjudicated on the final contract.
- No `BREACHED`, `NOT_AFFECTED` or `INCONCLUSIVE` final deployment adjudication, claim, or withdrawal was performed; no payout/withdrawal hashes exist.
- The Cisco advisory page used for investigation was first published `2026-09-16 16:00 GMT`; the Canadian Cyber Centre corroborating advisory was published `2026-09-17`. Both predate the demo warranty's start (`2026-09-19`). Therefore they cannot truthfully support a breach for that warranty's covered period. Do not alter the date rule or claim payout to make the demo appear successful.
- The first deployment's warranty/bond remains on-chain at the superseded contract; that release cannot be deleted. Do not imply it was settled. The final contract is newly deployed with empty state.
- A full, honest two-wallet settlement demonstration needs a new warranty whose covered interval is consistent with real source publication dates, and another fresh evidence packet whose source facts satisfy the frozen terms. Until then this repository is verified and deployed, but the requested live product demo is not submission-complete.
