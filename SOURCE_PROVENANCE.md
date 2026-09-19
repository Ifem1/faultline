# Source provenance

Faultline is an original implementation inspired by a design exercise around provenance, corroboration and consequential GenLayer consensus. It does not copy MemorySeal's contract model, state names, frontend, agent-memory purpose, policy registry, subject-head model, deployment addresses, or claim semantics.

The implementation uses public GenLayer development patterns for:

- pinned `py-genlayer` dependency headers;
- `gl.Contract` storage;
- `gl.nondet.web.get`;
- custom leader/validator replay with `gl.vm.run_nondet_unsafe`;
- finalized self-callbacks;
- native value transfer;
- `genlayer-js` Studionet clients;
- injected EIP-1193 providers;
- finalized reads and transaction lifecycle tracking.

Product-specific warranty economics, release/incident/evidence state machines, prompts, UI, tests and documentation are Faultline-specific.
