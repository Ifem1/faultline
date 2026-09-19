# Reviewer rubric mapping

This file is a build checklist, not a promised score. The reviewer rubric starts from zero and adds points only for visible evidence, so every claim below must be backed by working code, finalized deployment evidence, or a tested live flow.

## GenLayer fit

Faultline is designed around a consequence that should not be decided by one interested party:

- publisher bond and coverage payout are real economic consequences;
- publisher and coverage holders have opposing incentives;
- public security advisories are external, current and unstructured;
- affected-version language, severity language and exclusions require semantic interpretation;
- GenLayer validators independently reproduce the result;
- a centralized AI/operator would control who receives the bond, which is the trust problem the protocol removes.

Evidence needed for review:

- funded live warranty;
- two-wallet coverage flow;
- real public web sources fetched inside GenVM;
- finalized breach/not-affected/inconclusive outcomes;
- payout state caused by the breach verdict.

## Contract quality

The project uses one large Intelligent Contract by design. The rubric allows advanced code done well as an alternative to multi-contract architecture.

Substantive architecture inside the contract:

- release identity registry;
- funded warranties;
- coverage capacity and premiums;
- incident state machine;
- evidence commit/reveal;
- exact duplicate-source protection;
- source-family corroboration;
- source-examination nondeterministic consensus;
- warranty-adjudication nondeterministic consensus;
- typed LLM result normalization;
- explicit source-unavailable and inconclusive states;
- deterministic settlement;
- pull credits and native transfer;
- expiry/liveness paths;
- global accounting invariant.

Validator quality target:

- source validators reproduce every consequential source field, not JSON shape;
- warranty validators reproduce every consequential verdict field, not generic plausibility;
- free-form basis text is not used as the equality criterion;
- a malformed output raises an LLM error instead of becoming a decision.

## Engineering

Repository evidence should show:

- pinned GenVM dependency header;
- GenLayer storage types only for persisted state;
- GenVM lint passing;
- broad direct tests;
- live integration test(s);
- deterministic error prefixes;
- explicit network lock;
- CI;
- architecture/security/demo documentation;
- finalized deployment address and source/schema verification;
- no admin settlement backdoor;
- no backend verdict service.

## Frontend / UX

The frontend must be judged as a real contract application, not as a visual mock.

Required evidence:

- multipage Next.js application;
- hero landing page;
- finalized warranty list and detail views;
- funded warranty creation;
- coverage purchase;
- incident creation;
- commit/reveal source submission;
- recovery for a commitment that finalized before reveal;
- source examination results;
- adjudication;
- breach payout claim;
- credit withdrawal;
- injected EIP-1193 wallet;
- explicit wrong-network state;
- Studionet 61999 only;
- signing/submitted/decided/finalized transaction UX;
- understandable failure states;
- explorer access;
- no mocked chain result presented as live state.

## Reviewer-visible negative paths

Do not demo only the happy path. Show at least:

1. unrelated source → `INVALID_SOURCE`;
2. unavailable source → `SOURCE_UNAVAILABLE`, no financial verdict;
3. conflicting verified sources → `INCONCLUSIVE`, no warranty money moves;
4. different affected version → `NOT_AFFECTED`, bond remains in warranty;
5. exact qualifying release + corroboration → `BREACHED`, payout reserve created.
