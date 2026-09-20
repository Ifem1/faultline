# Faultline security model

## Principal boundaries

### Frozen warranty terms

Economic settlement never depends on warranty terms edited after coverage begins. The contract exposes no warranty mutation method.

### Exact release identity

A warranty points to a registered release with publisher, ecosystem, package, exact version, digest, and metadata URL.

### Adverse selection

Coverage closes before incidents can open. The protocol prevents purchases after an incident is active; it cannot prove that a person did not learn an advisory off-chain beforehand.

### Source trust and replay

HTTPS content is not automatically trustworthy. Source-family classification, package identity and material relevance are consensus fields. The contract requires multiple distinct source families. Validators reproduce substantive structured output fields; source text and user claims are untrusted input.

### Availability and capacity

A network failure or unavailable URL is SOURCE_UNAVAILABLE, a retryable non-decision. Separate active capacity from historical evidence indexing prevents SOURCE_UNAVAILABLE, INVALID_SOURCE, or UNREVEALED records from permanently filling all 12 slots. Retry must reacquire a slot while the incident remains OPEN and before deadline. VERIFIED records keep their slots. Settlement loops over a bounded verified index; historical reads are paginated.

### Consensus and settlement

Validator disagreement prevents an invalid nondeterministic transition. Typed evidence and adjudication results feed deterministic settlement; no LLM chooses transfer amounts or destinations. `FINALIZED` alone is not a successful write: the UI also requires successful GenVM execution.

### Pull payments and wallet boundary

Credits are assigned before transfer. Withdrawal sends only to the named credited recipient. Frontend access is generic injected EIP-1193 through `window.ethereum`; there are no private keys, backend signer, WalletConnect, embedded wallet, or Snaps.

## Known limits

- Studionet is a development network, not production settlement infrastructure.
- HTTPS provenance is not a cryptographic publisher attestation; source-family diversity does not prove institutional independence.
- GenVM web fetching may not expose a complete redirect chain.
- The protocol evaluates public evidence and does not discover zero-days.
- On the superseded 0.1.1 contract, one live result had correct structured `publication_in_window = false` but an incorrect free-text explanation citing August warranty dates. No adjudication ran and no funds moved due to that text. This is a semantic-output quality consideration, not an observed settlement vulnerability. Future hardening should make downstream judging and UI explicitly prioritize structured fields when explanatory prose conflicts. It is documented in [`REVIEW_EVIDENCE.md`](REVIEW_EVIDENCE.md); the 0.1.2 contract was not changed for it.
- Live historical lifecycle records refer only to the superseded 0.1.1 contract. New 0.1.2 retry/expiry/cancel writes have not been exercised on Studionet; Direct Mode and UI tests/eligibility plus live deployment/read verification cover the release.
