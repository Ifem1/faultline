# Faultline frontend

Multipage Next.js frontend for the Faultline Studionet deployment.

## Routes

- `/`
- `/warranties`
- `/warranties/[id]`
- `/incidents`
- `/incidents/[id]`
- `/open`
- `/account`
- `/protocol`

## Wallet boundary

The app uses a generic injected EIP-1193 provider from `window.ethereum`. It does not request wallet-specific extension APIs.

Reads use an account-free GenLayer client. Writes create a provider-backed Studionet client with the connected account and wait through decision and finalization states.

## No mock chain state

If `NEXT_PUBLIC_FAULTLINE_CONTRACT` is missing, the application shows a configuration notice rather than fake warranties or incidents.
