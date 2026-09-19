# Faultline security model

## Principal boundaries

### Frozen warranty terms

Economic settlement must never depend on warranty terms that can be edited after coverage begins. The current contract has no warranty mutation method.

### Exact release identity

A warranty points to a registered release with publisher, ecosystem, package name, exact version and SHA-256 release digest.

### Adverse selection boundary

Coverage closes before incidents are allowed to open. The protocol cannot prove that no human saw an undisclosed advisory before buying coverage; it prevents the simpler on-chain failure where users buy coverage after an incident is already active.

### Source trust

Faultline does not claim that any HTTPS URL is automatically trustworthy. Source-family classification, package identity and material relevance are themselves consensus fields. The protocol requires multiple distinct source families before adjudication.

### Prompt injection

Both prompts explicitly treat source content and user claims as untrusted data. Embedded role changes, commands and policy text are not authority. Typed normalization and independent replay limit the effect of arbitrary prose output.

### Source availability

Network failure or an unavailable URL is `SOURCE_UNAVAILABLE`, not `NOT_AFFECTED` and not `INVALID_SOURCE`. The evidence can be retried without moving warranty money.

### Consensus disagreement

Validator disagreement prevents the nondeterministic transaction from becoming a valid state transition. Faultline does not contain a fallback that guesses a financial verdict.

### Settlement

The nondeterministic result determines a typed verdict. Deterministic code then performs accounting. No LLM generates transfer amounts or destination addresses.

### Pull payments

The contract credits recipients before external transfer. `withdraw_credit(recipient)` always sends to the named credited recipient and cannot redirect someone else's balance.

### Injected wallet only

The frontend uses `window.ethereum` as an EIP-1193 provider and binds writes to Studionet 61999. It contains no private keys, backend signer, WalletConnect integration, embedded wallet, or MetaMask Snap request.

## Known limits

- Studionet is a development environment, not production settlement infrastructure.
- HTTPS provenance is not equivalent to a cryptographic publisher attestation.
- GenVM web fetching may follow redirects without exposing a complete redirect-chain proof to contract logic; reviewers should prefer stable canonical advisory URLs.
- Source-family diversity reduces simple duplication but does not prove institutional independence.
- The protocol evaluates disclosed public evidence; it does not discover zero-day vulnerabilities.
