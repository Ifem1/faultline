# Live demo script

Use at least two wallets on **Studionet 61999**.

## Demo objective

Show that a frozen software-release warranty controls real test GEN and that only a finalized GenLayer semantic verdict can turn the publisher bond into coverage payouts.

## Wallet roles

- Wallet A — publisher
- Wallet B — coverage holder / evidence contributor
- Optional Wallet C — second evidence contributor

## 1. Register release

Wallet A registers a clearly labelled demo release such as:

```text
ecosystem: demo
package: faultline-demo-parser
version: 3.7.4
release digest: sha256 of the demo release manifest
metadata URL: public demo release page
```

Record the transaction hash and resulting `fl-rel-*` ID.

## 2. Open warranty

Wallet A opens a warranty with a visible native GEN bond.

Suggested terms:

```text
severity: CVSS >= 9.0 or explicitly CRITICAL
class: remote code execution
exclusions: local-admin-only, development-only dependency, unsupported fork
minimum sources: 2
minimum source families: 2
```

Coverage close should be soon enough for the demo but still satisfy contract minimums.

## 3. Buy coverage

Wallet B buys a smaller coverage notional before the coverage window closes. Confirm:

- publisher receives premium as claimable credit;
- coverage is visible in finalized state;
- coverage amount cannot exceed remaining bond capacity.

## 4. Open incident

After coverage closes, open an incident against the warranty.

## 5. Negative evidence path

Submit a valid HTTPS source that is unrelated to the exact package. Expected result:

```text
INVALID_SOURCE
```

The incident verified-source count must not increase.

## 6. Unavailable-source path

Submit a URL that the runtime cannot fetch or a controlled endpoint returning non-200. Expected result:

```text
SOURCE_UNAVAILABLE
```

This is a retryable non-decision and must not create a breach or not-affected verdict.

## 7. Verified evidence

Submit two stable public demo advisory pages from two different source-family classes. Each should clearly establish the demo package, exact affected release range, severity and vulnerability class.

Confirm each source examination result is visible in the UI.

## 8. Adjudicate

Run the warranty adjudication. For the positive demo packet, the expected typed result is:

```text
BREACHED
```

Confirm:

- incident state becomes `BREACHED`;
- warranty state becomes `BREACHED`;
- warranty escrow decreases;
- payout reserve equals issued coverage;
- unused publisher bond becomes credit;
- accounting invariant remains true.

## 9. Claim payout

Wallet B calls the coverage claim, then withdraws credit.

Record the transaction hashes and explorer evidence.

## 10. Separate not-affected demonstration

On a second warranty, use two sources that consistently establish the disclosed issue affects a different version range. Expected result:

```text
NOT_AFFECTED
```

No warranty bond should move.

## 11. Inconclusive demonstration

On a third incident or test fixture, use materially conflicting verified evidence. Expected result:

```text
INCONCLUSIVE
```

The incident remains open and no warranty money moves.
