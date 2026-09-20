"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Faultline } from "@/lib/genlayer/faultline";
import { useWallet } from "@/lib/genlayer/wallet";
import type { IncidentRecord, ReleaseRecord, TxState, WarrantyRecord } from "@/lib/types";
import { formatDateTime, genFromAtto, shortAddress, toAtto } from "@/lib/format";
import { Status } from "@/components/Status";
import { TxRail } from "@/components/TxRail";
import { ConfigNotice } from "@/components/ConfigNotice";
import { LoadState } from "@/components/LoadState";

export default function WarrantyDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const wallet = useWallet();
  const [warranty, setWarranty] = useState<WarrantyRecord | null>(null);
  const [release, setRelease] = useState<ReleaseRecord | null>(null);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [coverage, setCoverage] = useState<any>(null);
  const [tx, setTx] = useState<TxState>({ stage: "idle" });
  const [loading, setLoading] = useState(Faultline.configured());
  const [error, setError] = useState("");
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));

  const refresh = useCallback(async () => {
    if (!Faultline.configured()) return;
    const w = await Faultline.warranty(id);
    const [r, rows] = await Promise.all([Faultline.release(w.release_id), Faultline.incidents(id)]);
    setWarranty(w); setRelease(r); setIncidents(rows);
    if (wallet.address) setCoverage(await Faultline.coverage(id, wallet.address));
  }, [id, wallet.address]);

  useEffect(() => { refresh().catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [refresh]);
  useEffect(() => {
    const timer = window.setInterval(() => setNowSeconds(Math.floor(Date.now() / 1000)), 5000);
    return () => window.clearInterval(timer);
  }, []);

  async function act(name: string, args: any[], value = 0n) {
    if (!wallet.address) return wallet.connect();
    if (!wallet.correctNetwork) return wallet.switchNetwork();
    setError("");
    try {
      await Faultline.write(wallet.address, name, args, value, setTx);
      await refresh();
    } catch (e: any) { setTx({ stage: "error", hash: e?.hash, message: e?.message || "Transaction failed" }); setError(e?.message || "Transaction failed"); }
  }

  async function buy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!warranty) return;
    const data = new FormData(event.currentTarget);
    const amount = toAtto(String(data.get("coverage")));
    const premium = (amount * BigInt(warranty.premium_bps) + 9999n) / 10000n;
    await act("buy_coverage", [id, amount], premium);
  }

  async function openIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await act("open_incident", [id, String(data.get("title")), String(data.get("hint"))]);
  }

  if (loading) return <div className="page-wrap"><LoadState /></div>;

  return (
    <div className="page-wrap">
      <ConfigNotice />
      {error ? <div className="error-box">{error}</div> : null}
      {warranty && release ? (
        <>
          <section className="warranty-hero">
            <div className="warranty-title-block">
              <div className="crumb"><Link href="/warranties">warranties</Link><span>/</span><b>{warranty.warranty_id}</b></div>
              <div className="warranty-package"><span>{release.ecosystem}</span><h1>{release.package_name}</h1><strong>{release.version}</strong></div>
              <p>{warranty.title}</p>
            </div>
            <div className="warranty-stamp"><Status value={warranty.status} /><span>publisher</span><b>{shortAddress(warranty.publisher)}</b><span>release digest</span><code>{release.release_digest?.slice(0, 18)}…</code></div>
          </section>

          <section className="bond-board">
            <div className="bond-big"><span>bond</span><strong>{genFromAtto(warranty.bond_atto)}</strong><small>GEN</small></div>
            <div><span>coverage issued</span><b>{genFromAtto(warranty.total_coverage_atto)} GEN</b></div>
            <div><span>premium</span><b>{Number(warranty.premium_bps) / 100}%</b></div>
            <div><span>coverage closes</span><b>{formatDateTime(warranty.coverage_closes_at)}</b></div>
            <div><span>warranty ends</span><b>{formatDateTime(warranty.ends_at)}</b></div>
          </section>

          <section className="terms-grid">
            <article><span>severity gate</span><p>{warranty.severity_rule}</p></article>
            <article><span>vulnerability class</span><p>{warranty.vulnerability_class}</p></article>
            <article><span>exclusions</span><p>{warranty.exclusions}</p></article>
            <article><span>corroboration</span><p>{warranty.min_sources} sources across {warranty.min_source_families} distinct source families.</p></article>
          </section>

          <section className="action-deck">
            <div className="action-copy"><span className="eyebrow">take a position</span><h2>Coverage is capped by the bond.</h2><p>Your premium goes to the publisher. If the warranty breaches, your registered coverage becomes claimable from the reserved bond.</p>{coverage && BigInt(coverage.coverage_atto || 0) > 0n ? <div className="your-position">your coverage <b>{genFromAtto(coverage.coverage_atto)} GEN</b>{coverage.claimed ? <em>claimed</em> : null}</div> : null}</div>
            <form className="action-form" onSubmit={buy}><label>coverage amount in GEN<input name="coverage" inputMode="decimal" placeholder="0.25" required /></label><button className="button button-acid">buy coverage</button></form>
          </section>

          {warranty.status === "BREACHED" && wallet.address && coverage && !coverage.claimed && BigInt(coverage.coverage_atto || 0) > 0n ? (
            <section className="breach-callout"><div><span>settlement ready</span><h2>Your coverage is now a claim.</h2></div><button className="button button-dark" onClick={() => act("claim_breach_payout", [id, wallet.address])}>claim payout</button></section>
          ) : null}

          <section className="terminal-actions">
            <div><span className="eyebrow">warranty lifecycle</span><h2>Cancellation and expiry</h2><p>Cancellation returns the publisher bond before coverage exists. Expiry returns an open warranty bond after its end time; neither action is available while an incident remains active.</p>
              {warranty.status === "OPEN" ? <small>Cancel: publisher only, zero coverage, no active incident. Expire: end time passed, no active incident.</small> : <small>Terminal actions are unavailable after this warranty closes.</small>}
            </div>
            <div className="terminal-action-buttons">
              {wallet.address?.toLowerCase() === warranty.publisher.toLowerCase() && warranty.status === "OPEN" && BigInt(warranty.total_coverage_atto || 0) === 0n && !warranty.active_incident_id ? <button className="button button-clear" onClick={() => act("cancel_warranty", [id])}>cancel warranty</button> : null}
              {warranty.status === "OPEN" && nowSeconds >= Number(warranty.ends_at) && !warranty.active_incident_id ? <button className="button button-dark" onClick={() => act("expire_warranty", [id])}>expire warranty</button> : null}
              {warranty.status === "OPEN" && !wallet.address ? <button className="button button-clear" onClick={() => wallet.connect()}>connect publisher wallet</button> : null}
            </div>
          </section>

          <section className="incident-section">
            <div className="section-bar"><div><span className="eyebrow">incident history</span><h2>Claims against this warranty</h2></div><span>{incidents.length} total</span></div>
            <div className="incident-mini-list">
              {incidents.map((incident) => <Link href={`/incidents/${incident.incident_id}`} key={incident.incident_id}><span>{incident.incident_id}</span><b>{incident.title}</b><small>{incident.verified_count} verified sources</small><Status value={incident.last_verdict || incident.status} /><i>↗</i></Link>)}
              {incidents.length === 0 ? <p className="muted-line">No incident has been opened against this warranty.</p> : null}
            </div>
            {warranty.status === "OPEN" && !warranty.active_incident_id ? (
              <form className="incident-open-form" onSubmit={openIncident}><label>incident title<input name="title" placeholder="Critical RCE disclosed for 3.7.x" required /></label><label>advisory hint<input name="hint" placeholder="CVE / GHSA / short reference" required /></label><button className="button button-dark">open incident</button></form>
            ) : null}
          </section>

          <TxRail state={tx} />
        </>
      ) : <div className="empty-state"><h3>warranty unavailable</h3><p>{error || "This record could not be read from finalized state."}</p></div>}
    </div>
  );
}
