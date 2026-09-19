# Release evidence — Studionet

This is the authoritative record of the final Studionet deployment, current engineering checks and live final-contract evidence. Transactions are linked to the Studionet explorer. “Finalized” is reported separately from execution success where relevant.

## Network and source quality

- `genlayer network info`: Studionet, chain `61999`, RPC `https://studio.genlayer.com/api`.
- Only one Intelligent Contract: `contracts/faultline.py`.
- `genvm-lint check contracts/faultline.py --json`: passed; 27 methods (12 views, 15 writes); informational I200 runner update notice only.
- `pytest tests/direct/ -v`: **20 passed**.
- `gltest tests/integration/ -v -s --network studionet`: **4/4 passed** in the current CI run.
- `cd frontend && npm run typecheck && npm run build`: both passed using Next.js 16.3.5.
- `genlayer schema 0x7655d42C17a8aE1E126af4982A901Bd121cDf221`: 27 methods, matching the source API.
- `genlayer code` output compared with `contracts/faultline.py`: exact source match after extracting the CLI's returned source (line endings normalized).
- Canonical `get_stats` readback: version `0.1.1-studionet`, Studionet/61999, required RPC and balanced accounting. Live activity registered three releases, opened funded warranties, sold coverage, opened incidents and submitted evidence. Cycle B expired without adjudication or payout.
- `genlayer call ... compute_evidence_commitment --args ...`: succeeded against the corrected deployment, exercising an address argument.

## Final deployment

- Contract: [`0x7655d42C17a8aE1E126af4982A901Bd121cDf221`](https://explorer-studio.genlayer.com/address/0x7655d42C17a8aE1E126af4982A901Bd121cDf221)
- Transaction: [`0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f`](https://explorer-studio.genlayer.com/tx/0x4592b0ff972d4f2378ce033d85ff8a46dab2950ae85129a9c259e02fbb15d88f)
- Receipt: status `7`, `FINALIZED`, deployment execution `SUCCESS`.
- The first deployment (`0xd8EFA86FF1377EdE221b5CF3e8106E900aD46B1c`, transaction `0xdff27efdc69ca504e84d70acd29862b63436ce140201d10f9a024c7f00a31781`) is superseded. The address normalization bug found during its live exercise was fixed in repository source and redeployed as version 0.1.1. Do not use the first address.
- Frontend `.env.example` and local `.env.local` use the final address, RPC, chain and Studionet explorer.
- Hosted frontend: [https://faultline-eight-lemon.vercel.app/](https://faultline-eight-lemon.vercel.app/). Current CI hosted-frontend check passes; deployed bundle was verified to contain the canonical address, RPC and chain ID. Frontend write UX requires successful GenVM execution in addition to finality, retains failed transaction hashes, and links directly to explorer transactions.

## Current CI and test summary

- Application/live-evidence baseline commit: [`3adf4a66a96fe7d410c425433462433e17fb853b`](https://github.com/Ifem1/faultline/commit/3adf4a66a96fe7d410c425433e17fb853b).
- Documentation release-cleanup commit: [`882e75edb815812dbdd666e46426a54612149c0e`](https://github.com/Ifem1/faultline/commit/882e75edb815812dbdd666e46426a54612149c0e); its complete green CI run: [35462574008](https://github.com/Ifem1/faultline/actions/runs/35462574008).
- GenVM lint: passed; 27 methods (12 views, 15 writes).
- Direct Mode: **20/20 passed**.
- Studionet integration: **4/4 passed**.
- Frontend: `npm ci`, typecheck, production build and hosted frontend CI check passed.
- Release/network hygiene check: passed. Repository remains locked to Studionet 61999 and generic injected EIP-1193 (`window.ethereum`).

## Final deployment activity (2026-09-19)

- Release `fl-rel-1` registered on the final deployment: transaction [`0x7a6bcde19520cd690593c4472bd5aaddc59bb586d3933529a33959a3605441ff`](https://explorer-studio.genlayer.com/tx/0x7a6bcde19520cd690593c4472bd5aaddc59bb586d3933529a33959a3605441ff), finalized (`MAJORITY_AGREE`). It identifies SiYuan `3.8.4` and its public GitHub release page.
- Cycle A release `fl-rel-2`: [`0x91a9fe798d1df6fd679d46d1dc38bf1c3b248c57122213a932ca75dbe4bdd67b`](https://explorer-studio.genlayer.com/tx/0x91a9fe798d1df6fd679d46d1dc38bf1c3b248c57122213a932ca75dbe4bdd67b). Cycle A warranty `fl-war-3` opened with 1 GEN bond: [`0x1563d7c82c24cdb2fbd322e4e5fbef25c9589af844c4ea878a963a3e56f58af0`](https://explorer-studio.genlayer.com/tx/0x1563d7c82c24cdb2fbd322e4e5fbef25c9589af844c4ea878a963a3e56f58af0). Wallet B bought 0.5 GEN coverage for a 0.025 GEN premium: [`0xa570dbafd4592e6b7eef405906d92689a061801a80a2d9ed0a05de356438c58c`](https://explorer-studio.genlayer.com/tx/0xa570dbafd4592e6b7eef405906d92689a061801a80a2d9ed0a05de356438c58c). Incident `fl-inc-1` opened after coverage closed: [`0xf82467ed27b69a8264e7a8fad33f75c87481a147597aa04239d08385b8043920`](https://explorer-studio.genlayer.com/tx/0xf82467ed27b69a8264e7a8fad33f75c87481a147597aa04239d08385b8043920).
- Cycle A evidence commit/reveal results: `fl-ev-1` committed [`0x4e41e98588c6da5f8729958fbe15b8565dfbcfbf52f32e87f5bf4aba5bd3c6c9`](https://explorer-studio.genlayer.com/tx/0x4e41e98588c6da5f8729958fbe15b8565dfbcfbf52f32e87f5bf4aba5bd3c6c9), revealed [`0x37d24d1e4f4f33321c72f7a193bdf7e4a6e012e4289f64d0510c370aa4921dba`](https://explorer-studio.genlayer.com/tx/0x37d24d1e4f4f33321c72f7a193bdf7e4a6e012e4289f64d0510c370aa4921dba), `SOURCE_UNAVAILABLE`; `fl-ev-2` commit [`0x75e9aded6989f9220f83d666a470395e5bde23147ae21c653c1d64b03f44a50d`](https://explorer-studio.genlayer.com/tx/0x75e9aded6989f9220f83d666a470395e5bde23147ae21c653c1d64b03f44a50d), reveal [`0x1f694b694b66e2db6aaff5af48f6994c73ff8d0d677fb5be82f31e22271e902f`](https://explorer-studio.genlayer.com/tx/0x1f694b694b66e2db6aaff5af48f6994c73ff8d0d677fb5be82f31e22271e902f), `INVALID_SOURCE`; `fl-ev-3` commit [`0x42870ca26a478039cdf6b6e96ff5749ca39feb95306422b51ba73f344f9543af`](https://explorer-studio.genlayer.com/tx/0x42870ca26a478039cdf6b6e96ff5749ca39feb95306422b51ba73f344f9543af), reveal [`0x9a773f595798d2a78da7db4f902515a3ae41983635e884451aa44d2d0721e117`](https://explorer-studio.genlayer.com/tx/0x9a773f595798d2a78da7db4f902515a3ae41983635e884451aa44d2d0721e117), `SOURCE_UNAVAILABLE`; `fl-ev-4` commit [`0xdae021fe6bb4cd80455059a02df9e48fb67f3729a4702d701557603e48fcb691`](https://explorer-studio.genlayer.com/tx/0xdae021fe6bb4cd80455059a02df9e48fb67f3729a4702d701557603e48fcb691), reveal [`0xe571e39b93e9080ce3e48b2ba347140e0157e5421c3827bb34d3f9fa3a6434f2`](https://explorer-studio.genlayer.com/tx/0xe571e39b93e9080ce3e48b2ba347140e0157e5421c3827bb34d3f9fa3a6434f2), `INVALID_SOURCE`; `fl-ev-5` commit [`0xd3d260d92c6cd5918d9ba294ef192dda8b37a54c6fc340da066214748cfe70b2`](https://explorer-studio.genlayer.com/tx/0xd3d260d92c6cd5918d9ba294ef192dda8b37a54c6fc340da066214748cfe70b2), reveal [`0xa5864d75ecdd337810c8d372a5c9b6aa00c53a731e9f5b8cddde2fa418c7d8c1`](https://explorer-studio.genlayer.com/tx/0xa5864d75ecdd337810c8d372a5c9b6aa00c53a731e9f5b8cddde2fa418c7d8c1), `SOURCE_UNAVAILABLE`; `fl-ev-7` commit [`0xb6e1a2ac5dc9f32ef1dc513783650d6068305957c09fe64453d6f348b3d3ddcc`](https://explorer-studio.genlayer.com/tx/0xb6e1a2ac5dc9f32ef1dc513783650d6068305957c09fe64453d6f348b3d3ddcc), reveal [`0x25ebf0833e5a8e1ef83e3a37eb11ede2a585b82d22eca96aa3aac4db3efda366`](https://explorer-studio.genlayer.com/tx/0x25ebf0833e5a8e1ef83e3a37eb11ede2a585b82d22eca96aa3aac4db3efda366), `SOURCE_UNAVAILABLE`.
- `fl-ev-6` (Tenable), `fl-ev-8` (vendor source), and `fl-ev-9` (NVD API) had pending source examination at the last check; they are not claimed as verified or as a breach. The evidence window expired before two independent source families reached `VERIFIED`, so `fl-inc-1` was not adjudicated. No payout reserve or claim exists.
- Cycle B release `fl-rel-3`: [`0x1e4f7ccddf87ecf2847873d7c872c10c19a26426388f27b725d9e805ea6eb1a7`](https://explorer-studio.genlayer.com/tx/0x1e4f7ccddf87ecf2847873d7c872c10c19a26426388f27b725d9e805ea6eb1a7). Warranty `fl-war-4` opened with a 1 GEN bond: [`0xea08f1d98fde6b84ec48d05f031a27db7c7d0c36046d2d31d7c812b8a402e100`](https://explorer-studio.genlayer.com/tx/0xea08f1d98fde6b84ec48d05f031a27db7c7d0c36046d2d31d7c812b8a402e100). Wallet C bought 0.5 GEN coverage for a 0.025 GEN premium: [`0x5ef496d2b50d483e23a44d948a2773be46a7fe3964d70a7f31720c5b8fb8f3d7`](https://explorer-studio.genlayer.com/tx/0x5ef496d2b50d483e23a44d948a2773be46a7fe3964d70a7f31720c5b8fb8f3d7). Incident `fl-inc-2` opened after coverage closed: [`0x1cbe58abd39f5048eb77a60a7e387e7fd2c52edcd07298dc951fbaaff0d6d252`](https://explorer-studio.genlayer.com/tx/0x1cbe58abd39f5048eb77a60a7e387e7fd2c52edcd07298dc951fbaaff0d6d252).

### Cycle B evidence and expiry

| Evidence | Family/source | Commit transaction | Reveal transaction | Last verified result/state |
| --- | --- | --- | --- | --- |
| `fl-ev-10` | `GITHUB_ADVISORY` | [`0x32d06b0a591f49064564f848d88dd7674c50ffb1d213825c460ef64785c8e119`](https://explorer-studio.genlayer.com/tx/0x32d06b0a591f49064564f848d88dd7674c50ffb1d213825c460ef64785c8e119) | [`0xde08fe372ef7d844d29696e577300203057bc4976abe21a8b01d20d0e189d879`](https://explorer-studio.genlayer.com/tx/0xde08fe372ef7d844d29696e577300203057bc4976abe21a8b01d20d0e189d879) | `SOURCE_UNAVAILABLE` |
| `fl-ev-11` | NVD | [`0x75076db9688e306f24fe4e76b926c384b9ee62226d7b81c81aeade5e8a63bd9e`](https://explorer-studio.genlayer.com/tx/0x75076db9688e306f24fe4e76b926c384b9ee62226d7b81c81aeade5e8a63bd9e) | [`0x28b27376b81f0cbb53b4d501b24e4c920415ecfbd642aaf7e16003a85e3c4bb1`](https://explorer-studio.genlayer.com/tx/0x28b27376b81f0cbb53b4d501b24e4c920415ecfbd642aaf7e16003a85e3c4bb1) | `PENDING_SOURCE` at last observation |
| `fl-ev-12` | reveal salt unavailable | [`0x82978b212dd66e9905f77c98edfe58ad034cfd3f88a603f0e58cf2abc1e48624`](https://explorer-studio.genlayer.com/tx/0x82978b212dd66e9905f77c98edfe58ad034cfd3f88a603f0e58cf2abc1e48624) | No reveal; `UNREVEALED` | Bond resolution: [`0xdb182098eefd145d42e5277d1ec65a27683fabd6727fa9de6ddc288ebb03906e`](https://explorer-studio.genlayer.com/tx/0xdb182098eefd145d42e5277d1ec65a27683fabd6727fa9de6ddc288ebb03906e) |
| `fl-ev-13` | `SECURITY_RESEARCH` / VulnCheck | [`0xf10f4cff303ea93c85040ce93122998e24abc5901f5d80ad692137620147e9cd`](https://explorer-studio.genlayer.com/tx/0xf10f4cff303ea93c85040ce93122998e24abc5901f5d80ad692137620147e9cd) | [`0x1c434b2031513ef9ae9a495da75a036e268c43eb2a394cb8b4edca9bbfafb6ec`](https://explorer-studio.genlayer.com/tx/0x1c434b2031513ef9ae9a495da75a036e268c43eb2a394cb8b4edca9bbfafb6ec) | `VERIFIED`; structured `publication_in_window = false` |
| `fl-ev-14` | vendor raw source | [`0xa8fd0068df8b75c0bebfaa7726cf7d49f556e035c2f0dbee489ebdaf775bfc54`](https://explorer-studio.genlayer.com/tx/0xa8fd0068df8b75c0bebfaa7726cf7d49f556e035c2f0dbee489ebdaf775bfc54) | [`0xbd9f7d6f134f6a3e14385387e028026197028b984529e09d3af48a1425142fc7`](https://explorer-studio.genlayer.com/tx/0xbd9f7d6f134f6a3e14385387e028026197028b984529e09d3af48a1425142fc7) | `PENDING_SOURCE` at last observation |
| `fl-ev-15` | vendor source via jsDelivr | [`0x613f78462ed8ce8fd73364cb88cc86b2ac2a0b5da71b5d9bdaf2943f8d5dccd5`](https://explorer-studio.genlayer.com/tx/0x613f78462ed8ce8fd73364cb88cc86b2ac2a0b5da71b5d9bdaf2943f8d5dccd5) | [`0xbc93f143a7b41121761004d309ca9b57a879bb5d83aa5d91e0802ca8648a87c5`](https://explorer-studio.genlayer.com/tx/0xbc93f143a7b41121761004d309ca9b57a879bb5d83aa5d91e0802ca8648a87c5) | `PENDING_SOURCE` at last observation |

After the evidence deadline, retry transaction [`0x19561010843c0033fcf75b7fbaaa846b8cddbbf99b2f00d48ff017615067b1c2`](https://explorer-studio.genlayer.com/tx/0x19561010843c0033fcf75b7fbaaa846b8cddbbf99b2f00d48ff017615067b1c2) finalized but execution ended in `ERROR`: `retry_evidence` is only allowed while the evidence window is open. This is expected deadline enforcement and demonstrates that `FINALIZED` by itself does not mean successful execution.

Incident expiry transaction [`0xd1d79c6aa6b017866d73fb36c499d294ded04f31d63e6ae0173871afbb2f3876`](https://explorer-studio.genlayer.com/tx/0xd1d79c6aa6b017866d73fb36c499d294ded04f31d63e6ae0173871afbb2f3876) finalized successfully. Final incident readback: status `EXPIRED`, `last_verdict = INCONCLUSIVE`, `adjudication_rounds = 0`. This was the liveness fallback from `expire_incident`, **not** an adjudicated `INCONCLUSIVE` result: only one evidence family reached `VERIFIED`, below the frozen minimum of two.

Warranty expiry transaction [`0x2f94f3df8d3035cd2a8eb4095306bfc4e912e20e2bcbf320073fc5415e60ba59`](https://explorer-studio.genlayer.com/tx/0x2f94f3df8d3035cd2a8eb4095306bfc4e912e20e2bcbf320073fc5415e60ba59) finalized successfully with no payout reserve. Publisher credit withdrawal transaction [`0xdc6228fbec49482c3928f7aa92deb1e2f72b08d5af224e7289f8ab07e32f3659`](https://explorer-studio.genlayer.com/tx/0xdc6228fbec49482c3928f7aa92deb1e2f72b08d5af224e7289f8ab07e32f3659) finalized successfully. This withdrew publisher credit after expiry; it was **not** a coverage claim or breach payout.

The GHSA advisory [GHSA-8c2m-33v9-vvqm](https://github.com/siyuan-note/siyuan/security/advisories/GHSA-8c2m-33v9-vvqm) was published September 18, 2026. NVD [CVE-2026-93922](https://nvd.nist.gov/vuln/detail/CVE-2026-93922) records publication at 2026-09-19 00:16 UTC. Cycle B warranty `fl-war-4` began around 2026-09-19 15:22 UTC. Both public disclosures predate the warranty start; they cannot truthfully establish the required in-window breach condition. No dates, validation rules or warranty terms were changed.

#### Source-basis discrepancy

For `fl-ev-13`, the structured field `publication_in_window = false` is correct. Its free-text `basis` reportedly cites incorrect August warranty dates. That explanatory text was wrong. No adjudication ran, and it did not move funds. Source consensus validators reproduce the substantive structured fields used by the protocol. This is a semantic-output quality limitation: future hardening should make downstream judging and UI presentation explicitly prioritize structured fields when explanatory prose conflicts with them. No contract change is part of this release.

## Final accounting readback

Latest observed `get_stats` values:

- `accounting_balanced`: `true`
- `payout_reserve_atto`: `0`
- `evidence_escrow_atto`: `600000000000000` (0.0006 GEN)
- `claimable_atto`: `200000000000000` (0.0002 GEN)

Some evidence callbacks remain pending elsewhere on the contract. These balances are a readback at the documented observation point; they do not imply every source submission had settled.

## What was not demonstrated live

- Neither final-contract evidence cycle reached an adjudication. In Cycle A the evidence threshold was not met; in Cycle B only one source family was verified before expiry.
- No live `BREACHED` or `NOT_AFFECTED` adjudication, payout reserve, coverage claim or coverage payout withdrawal occurred.
- No final-contract live `INCONCLUSIVE` adjudication occurred. Cycle B’s `INCONCLUSIVE` label came from incident expiry with zero adjudication rounds.
- The positive `BREACHED` → reserve → claim → withdrawal path is covered by the **20 Direct Mode tests**; it is not represented as a live transaction.
- Browser-injected wallet production writes were not separately exercised as part of this evidence record. The hosted site and bundle configuration are verified by CI.
- An earlier 0.25 GEN warranty `fl-war-1` finalized as [`0x08c95e0f6788a86b4002da7c53fc5d063b485e7a2b87d67e0ad81c4913e8d1e7`](https://explorer-studio.genlayer.com/tx/0x08c95e0f6788a86b4002da7c53fc5d063b485e7a2b87d67e0ad81c4913e8d1e7); its coverage interval elapsed without a purchase. `fl-war-2` was canceled and its 1 GEN credit withdrawn in [`0x2cdcdff37fc16634620217c5d40131d75a6ec13079437c10e3f916ba3d1bc0fc`](https://explorer-studio.genlayer.com/tx/0x2cdcdff37fc16634620217c5d40131d75a6ec13079437c10e3f916ba3d1bc0fc).
- Claimable credits from returned evidence bonds/invalid-source penalties were withdrawn: publisher A [`0x7bccd854daae22792a64ac559283ccd3461ebb8a9773fe8c5878ace0de47d1af`](https://explorer-studio.genlayer.com/tx/0x7bccd854daae22792a64ac559283ccd3461ebb8a9773fe8c5878ace0de47d1af), wallet B [`0x657271a840e86accd606c1ec24a12a828c724ecef189d59587005f72bb2ae6a2`](https://explorer-studio.genlayer.com/tx/0x657271a840e86accd606c1ec24a12a828c724ecef189d59587005f72bb2ae6a2), wallet C [`0x0e3849d6123ea08cd33e9718b9f8d91fc632748f0f94d19cd5d7baec79b46fd4`](https://explorer-studio.genlayer.com/tx/0x0e3849d6123ea08cd33e9718b9f8d91fc632748f0f94d19cd5d7baec79b46fd4). These were credit withdrawals, not coverage payouts or claims.
- The final deployment has three releases, four warranties, two incidents and 15 evidence submissions across all recorded final-contract activity. Both cycles had real release/funded warranty/coverage/incident/evidence activity, but neither reached live adjudication.

## Tests and application

- `frontend/src/lib/genlayer/client.ts` fails closed unless the selected chain is 61999 and the RPC is exactly `https://studio.genlayer.com/api`; wallet transport remains generic injected EIP-1193 (`window.ethereum`).
- Production typecheck/build and hosted frontend CI checks pass; the public URL and exact canonical network configuration are linked above.
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

## Cycle A withdrawal clarification

Cycle A and earlier final-contract credit withdrawals are recorded above. Those withdrawals were claimable evidence credits, returned bond credits or expired/canceled publisher bond credits; they were not coverage claims or breach payouts. Cycle A did not satisfy the two-independent-family threshold and was not adjudicated.

## Superseded deployment activity

The historical two-wallet transaction list below concerns the first, superseded contract only. Keep it explicitly labeled as such; it is not evidence for the canonical contract. The first deployment remains immutable on Studionet and is not canonical.
