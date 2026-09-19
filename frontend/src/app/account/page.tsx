"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHead } from "@/components/PageHead";
import { TxRail } from "@/components/TxRail";
import { Faultline } from "@/lib/genlayer/faultline";
import { useWallet } from "@/lib/genlayer/wallet";
import { genFromAtto, shortAddress } from "@/lib/format";
import type { TxState, WarrantyRecord } from "@/lib/types";

export default function AccountPage() {
  const wallet = useWallet();
  const [credit, setCredit] = useState("0");
  const [positions, setPositions] = useState<Array<{ warranty: WarrantyRecord; coverage: any }>>([]);
  const [tx, setTx] = useState<TxState>({ stage: "idle" });
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!wallet.address || !Faultline.configured()) return;
    const [amount, warranties] = await Promise.all([Faultline.credit(wallet.address), Faultline.listWarranties()]);
    const rows = await Promise.all(warranties.map(async warranty => ({ warranty, coverage: await Faultline.coverage(warranty.warranty_id, wallet.address!) })));
    setCredit(amount); setPositions(rows.filter(row => BigInt(row.coverage.coverage_atto || 0) > 0n));
  }, [wallet.address]);

  useEffect(() => { refresh().catch((e) => setError(e.message)); }, [refresh]);

  async function withdraw() {
    if (!wallet.address) return wallet.connect();
    try { await Faultline.write(wallet.address, "withdraw_credit", [wallet.address], 0n, setTx); await refresh(); }
    catch (e: any) { setTx({ stage: "error", hash: e?.hash, message: e?.message || "Withdrawal failed" }); setError(e?.message || "Withdrawal failed"); }
  }

  return (
    <div className="page-wrap">
      <PageHead eyebrow="wallet ledger" title="Your position" body="Faultline uses pull payments. Premiums, returned evidence bonds, publisher refunds and breach payouts become contract credits before they leave the protocol." />
      {!wallet.connected ? <section className="connect-slab"><h2>Connect an injected wallet.</h2><p>No embedded account. No Snap. No backend signer.</p><button className="button button-acid" onClick={() => wallet.connect()}>connect wallet</button></section> : (
        <>
          {error ? <div className="error-box">{error}</div> : null}
          <section className="account-hero"><div><span>wallet</span><b>{shortAddress(wallet.address)}</b></div><div className="credit-amount"><span>claimable credit</span><strong>{genFromAtto(credit)}</strong><small>GEN</small></div><button className="button button-dark" disabled={BigInt(credit) === 0n} onClick={withdraw}>withdraw credit</button></section>
          <section className="positions"><div className="section-bar"><h2>Coverage positions</h2><span>{positions.length}</span></div>{positions.map(({ warranty, coverage }) => <div className="position-row" key={warranty.warranty_id}><div><b>{warranty.title}</b><span>{warranty.warranty_id}</span></div><div><span>coverage</span><b>{genFromAtto(coverage.coverage_atto)} GEN</b></div><div><span>status</span><b>{warranty.status}</b></div><div><span>payout</span><b>{coverage.claimed ? "claimed" : warranty.status === "BREACHED" ? "ready" : "—"}</b></div></div>)}{positions.length === 0 ? <p className="muted-line">No coverage positions for this wallet.</p> : null}</section>
          <TxRail state={tx} />
        </>
      )}
    </div>
  );
}
