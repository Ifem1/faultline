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
- `genlayer call ... get_stats`: version `0.1.1-studionet`, Studionet/61999, required RPC, balanced accounting. Subsequent live activity registered three releases, opened funded warranties, sold coverage, opened one incident, and submitted evidence; no adjudication or payout was completed.
- `genlayer call ... compute_evidence_commitment --args ...`: succeeded against the corrected deployment, exercising an address argument.

## Final deployment

- Contract: [`0x7655d42C17a8aE1E126af4982A901Bd121cDf221`](https://explorer-studio.genlayer.com/address/0x7655d42C17a8aE1E126af4982A901Bd121cDf221)
- Transaction: [`0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f`](https://explorer-studio.genlayer.com/tx/0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f)
- Receipt: status `7`, `FINALIZED`, deployment execution `SUCCESS`.
- The first deployment (`0xd8EFA86FF1377EdE221b5CF3e8106E900aD46B1c`, transaction `0xdff27efdc69ca504e84d70acd29862b63436ce140201d10f9a024c7f00a31781`) is superseded. The address normalization bug found during its live exercise was fixed in repository source and redeployed as version 0.1.1. Do not use the first address.
- Frontend `.env.example` and local `.env.local` use the final address, RPC, chain and Studionet explorer.

## Final deployment activity (2026-09-19)

- Release `fl-rel-1` registered on the final deployment: transaction [`0x7a6bcde19520cd690593c4472bd5aaddc59bb586d3933529a33959a3605441ff`](https://explorer-studio.genlayer.com/tx/0x7a6bcde19520cd690593c4472bd5aaddc59bb586d3933529a33959a3605441ff), finalized (`MAJORITY_AGREE`). It identifies SiYuan `3.8.4` and its public GitHub release page.
- Cycle A release `fl-rel-2`: [`0x91a9fe798d1df6fd679d46d1dc38bf1c3b248c57122213a932ca75dbe4bdd67b`](https://explorer-studio.genlayer.com/tx/0x91a9fe798d1df6fd679d46d1dc38bf1c3b248c57122213a932ca75dbe4bdd67b). Cycle A warranty `fl-war-3` opened with 1 GEN bond: [`0x1563d7c82c24cdb2fbd322e4e5fbef25c9589af844c4ea878a963a3e56f58af0`](https://explorer-studio.genlayer.com/tx/0x1563d7c82c24cdb2fbd322e4e5fbef25c9589af844c4ea878a963a3e56f58af0). Wallet B bought 0.5 GEN coverage for a 0.025 GEN premium: [`0xa570dbafd4592e6b7eef405906d92689a061801a80a2d9ed0a05de356438c58c`](https://explorer-studio.genlayer.com/tx/0xa570dbafd4592e6b7eef405906d92689a061801a80a2d9ed0a05de356438c58c). Incident `fl-inc-1` opened after coverage closed: [`0xf82467ed27b69a8264e7a8fad33f75c87481a147597aa04239d08385b8043920`](https://explorer-studio.genlayer.com/tx/0xf82467ed27b69a8264e7a8fad33f75c87481a147597aa04239d08385b8043920).
- Cycle A evidence commit/reveal results: `fl-ev-1` committed [`0x4e41e98588c6da5f8729958fbe15b8565dfbcfbf52f32e87f5bf4aba5bd3c6c9`](https://explorer-studio.genlayer.com/tx/0x4e41e98588c6da5f8729958fbe15b8565dfbcfbf52f32e87f5bf4aba5bd3c6c9), revealed [`0x37d24d1e4f4f33321c72f7a193bdf7e4a6e012e4289f64d0510c370aa4921dba`](https://explorer-studio.genlayer.com/tx/0x37d24d1e4f4f33321c72f7a193bdf7e4a6e012e4289f64d0510c370aa4921dba), `SOURCE_UNAVAILABLE`; `fl-ev-2` commit [`0x75e9aded6989f9220f83d666a470395e5bde23147ae21c653c1d64b03f44a50d`](https://explorer-studio.genlayer.com/tx/0x75e9aded6989f9220f83d666a470395e5bde23147ae21c653c1d64b03f44a50d), reveal [`0x1f694b694b66e2db6aaff5af48f6994c73ff8d0d677fb5be82f31e22271e902f`](https://explorer-studio.genlayer.com/tx/0x1f694b694b66e2db6aaff5af48f6994c73ff8d0d677fb5be82f31e22271e902f), `INVALID_SOURCE`; `fl-ev-3` commit [`0x42870ca26a478039cdf6b6e96ff5749ca39feb95306422b51ba73f344f9543af`](https://explorer-studio.genlayer.com/tx/0x42870ca26a478039cdf6b6e96ff5749ca39feb95306422b51ba73f344f9543af), reveal [`0x9a773f595798d2a78da7db4f902515a3ae41983635e884451aa44d2d0721e117`](https://explorer-studio.genlayer.com/tx/0x9a773f595798d2a78da7db4f902515a3ae41983635e884451aa44d2d0721e117), `SOURCE_UNAVAILABLE`; `fl-ev-4` commit [`0xdae021fe6bb4cd80455059a02df9e48fb67f3729a4702d701557603e48fcb691`](https://explorer-studio.genlayer.com/tx/0xdae021fe6bb4cd80455059a02df9e48fb67f3729a4702d701557603e48fcb691), reveal [`0xe571e39b93e9080ce3e48b2ba347140e0157e5421c3827bb34d3f9fa3a6434f2`](https://explorer-studio.genlayer.com/tx/0xe571e39b93e9080ce3e48b2ba347140e0157e5421c3827bb34d3f9fa3a6434f2), `INVALID_SOURCE`; `fl-ev-5` commit [`0xd3d260d92c6cd5918d9ba294ef192dda8b37a54c6fc340da066214748cfe70b2`](https://explorer-studio.genlayer.com/tx/0xd3d260d92c6cd5918d9ba294ef192dda8b37a54c6fc340da066214748cfe70b2), reveal [`0xa5864d75ecdd337810c8d372a5c9b6aa00c53a731e9f5b8cddde2fa418c7d8c1`](https://explorer-studio.genlayer.com/tx/0xa5864d75ecdd337810c8d372a5c9b6aa00c53a731e9f5b8cddde2fa418c7d8c1), `SOURCE_UNAVAILABLE`; `fl-ev-7` commit [`0xb6e1a2ac5dc9f32ef1dc513783650d6068305957c09fe64453d6f348b3d3ddcc`](https://explorer-studio.genlayer.com/tx/0xb6e1a2ac5dc9f32ef1dc513783650d6068305957c09fe64453d6f348b3d3ddcc), reveal [`0x25ebf0833e5a8e1ef83e3a37eb11ede2a585b82d22eca96aa3aac4db3efda366`](https://explorer-studio.genlayer.com/tx/0x25ebf0833e5a8e1ef83e3a37eb11ede2a585b82d22eca96aa3aac4db3efda366), `SOURCE_UNAVAILABLE`.
- `fl-ev-6` (Tenable), `fl-ev-8` (vendor source), and `fl-ev-9` (NVD API) had pending source examination at the last check; they are not claimed as verified or as a breach. The evidence window expired before two independent source families reached `VERIFIED`, so `fl-inc-1` was not adjudicated. No payout reserve or claim exists.
- Cycle B release `fl-rel-3`: [`0x1e4f7ccddf87ecf2847873d7c872c10c19a26426388f27b725d9e805ea6eb1a7`](https://explorer-studio.genlayer.com/tx/0x1e4f7ccddf87ecf2847873d7c872c10c19a26426388f27b725d9e805ea6eb1a7). Warranty `fl-war-4` opened with 1 GEN bond: [`0xea08f1d98fde6b84ec48d05f031a27db7c7d0c36046d2d31d7c812b8a402e100`](https://explorer-studio.genlayer.com/tx/0xea08f1d98fde6b84ec48d05f031a27db7c7d0c36046d2d31d7c812b8a402e100). Wallet C bought 0.5 GEN coverage for 0.025 GEN premium: [`0x5ef496d2b50d483e23a44d948a2773be46a7fe3964d70a7f31720c5b8fb8f3d7`](https://explorer-studio.genlayer.com/tx/0x5ef496d2b50d483e23a44d948a2773be46a7fe3964d70a7f31720c5b8fb8f3d7). The coverage sale closed; no Cycle B incident or evidence had been submitted at last check.
- An earlier 0.25 GEN warranty `fl-war-1` finalized as [`0x08c95e0f6788a86b4002da7c53fc5d063b485e7a2b87d67e0ad81c4913e8d1e7`](https://explorer-studio.genlayer.com/tx/0x08c95e0f6788a86b4002da7c53fc5d063b485e7a2b87d67e0ad81c4913e8d1e7); its coverage interval elapsed without a purchase. `fl-war-2` was canceled and its 1 GEN credit withdrawn in [`0x2cdcdff37fc16634620217c5d40131d75a6ec13079437c10e3f916ba3d1bc0fc`](https://explorer-studio.genlayer.com/tx/0x2cdcdff37fc16634620217c5d40131d75a6ec13079437c10e3f916ba3d1bc0fc).
- Claimable credits from returned evidence bonds/invalid-source penalties were withdrawn: publisher A [`0x7bccd854daae22792a64ac559283ccd3461ebb8a9773fe8c5878ace0de47d1af`](https://explorer-studio.genlayer.com/tx/0x7bccd854daae22792a64ac559283ccd3461ebb8a9773fe8c5878ace0de47d1af), wallet B [`0x657271a840e86accd606c1ec24a12a828c724ecef189d59587005f72bb2ae6a2`](https://explorer-studio.genlayer.com/tx/0x657271a840e86accd606c1ec24a12a828c724ecef189d59587005f72bb2ae6a2), wallet C [`0x0e3849d6123ea08cd33e9718b9f8d91fc632748f0f94d19cd5d7baec79b46fd4`](https://explorer-studio.genlayer.com/tx/0x0e3849d6123ea08cd33e9718b9f8d91fc632748f0f94d19cd5d7baec79b46fd4). These were credit withdrawals, not coverage payouts or claims.
- The final deployment now has three releases, two funded warranties with purchased coverage, and one incident with source submissions. No full live cycle has completed.

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

- Live `SOURCE_UNAVAILABLE` outcomes were observed and evidence bonds were returned; this confirms retryable non-decision behavior on the final deployment.
- No two independently verified source families were adjudicated on the final contract.
- No `BREACHED`, `NOT_AFFECTED` or `INCONCLUSIVE` final deployment adjudication, claim, or withdrawal was performed; no payout/withdrawal hashes exist.
- The Cisco advisory page used for investigation was first published `2026-09-16 16:00 GMT`; the Canadian Cyber Centre corroborating advisory was published `2026-09-17`. Both predate the demo warranty's start (`2026-09-19`). Therefore they cannot truthfully support a breach for that warranty's covered period. Do not alter the date rule or claim payout to make the demo appear successful.
- The first deployment's warranty/bond remains on-chain at the superseded contract; that release cannot be deleted. Do not imply it was settled. The final contract's active warranty and coverage lifecycle did not reach adjudication.
- Two full cycles, an adjudication, and payout/claim withdrawal remain incomplete. Available source examination did not truthfully establish two verified independent families for an in-window breach; do not alter date or validation rules to manufacture a result.
