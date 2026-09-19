"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHead } from "@/components/PageHead";
import { ConfigNotice } from "@/components/ConfigNotice";
import { TxRail } from "@/components/TxRail";
import { Faultline } from "@/lib/genlayer/faultline";
import { useWallet } from "@/lib/genlayer/wallet";
import { toAtto } from "@/lib/format";
import type { ReleaseRecord, TxState } from "@/lib/types";

function unix(value: FormDataEntryValue | null) {
  const ms = new Date(String(value)).getTime();
  if (!Number.isFinite(ms)) throw new Error("Choose a valid date and time.");
  return Math.floor(ms / 1000);
}

export default function OpenPage() {
  const wallet = useWallet();
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [tx, setTx] = useState<TxState>({ stage: "idle" });
  const [error, setError] = useState("");

  async function refresh() { if (Faultline.configured()) setReleases(await Faultline.listReleases()); }
  useEffect(() => { refresh().catch(() => undefined); }, []);

  async function act(name: string, args: any[], value = 0n) {
    if (!wallet.address) { await wallet.connect(); return false; }
    if (!wallet.correctNetwork) { await wallet.switchNetwork(); return false; }
    setError("");
    try { await Faultline.write(wallet.address, name, args, value, setTx); await refresh(); return true; }
    catch (e: any) { setTx({ stage: "error", hash: e?.hash, message: e?.message || "Transaction failed" }); setError(e?.message || "Transaction failed"); return false; }
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const d = new FormData(form);
    const ok = await act("register_release", [String(d.get("ecosystem")), String(d.get("package")), String(d.get("version")), String(d.get("digest")), String(d.get("metadata"))]);
    if (ok) form.reset();
  }

  async function warrant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const d = new FormData(form);
    const bond = toAtto(String(d.get("bond")));
    const evidenceBond = toAtto(String(d.get("evidenceBond")));
    const ok = await act("open_warranty", [
      String(d.get("releaseId")), String(d.get("title")), String(d.get("severity")), String(d.get("class")), String(d.get("exclusions")),
      Number(d.get("premiumBps")), unix(d.get("coverageClose")), unix(d.get("end")), Number(d.get("incidentWindow")), Number(d.get("minSources")), Number(d.get("minFamilies")), evidenceBond
    ], bond);
    if (ok) form.reset();
  }

  return (
    <div className="page-wrap">
      <PageHead eyebrow="publisher desk" title="Put a bond behind the release." body="Faultline separates release identity from the warranty. Register the release once, then open a funded warranty with terms that cannot move after coverage begins." />
      <ConfigNotice />
      {error ? <div className="error-box">{error}</div> : null}
      <section className="open-split">
        <article className="open-panel">
          <div className="open-no">01</div><span className="eyebrow">release identity</span><h2>Register release</h2><p>The digest is a lowercase SHA-256 fingerprint of the release artifact or canonical release manifest.</p>
          <form className="stack-form" onSubmit={register}>
            <div className="form-pair"><label>ecosystem<input name="ecosystem" placeholder="npm" required /></label><label>version<input name="version" placeholder="3.7.4" required /></label></div>
            <label>package / project<input name="package" placeholder="@acme/parser" required /></label>
            <label>release sha256<input name="digest" pattern="[0-9a-f]{64}" placeholder="64 lowercase hex characters" required /></label>
            <label>canonical release URL<input name="metadata" type="url" placeholder="https://…" required /></label>
            <button className="button button-dark">register release</button>
          </form>
        </article>

        <article className="open-panel open-panel-acid">
          <div className="open-no">02</div><span className="eyebrow">fund the promise</span><h2>Open warranty</h2><p>Coverage closes before incidents can open. The warranty stays live until its end or a finalized breach.</p>
          <form className="stack-form" onSubmit={warrant}>
            <label>release<select name="releaseId" required><option value="">select registered release</option>{releases.map(r => <option key={r.release_id} value={r.release_id}>{r.package_name} · {r.version} · {r.release_id}</option>)}</select></label>
            <label>warranty title<input name="title" placeholder="Critical RCE warranty" required /></label>
            <div className="form-pair"><label>publisher bond (GEN)<input name="bond" inputMode="decimal" placeholder="5" required /></label><label>premium (bps)<input name="premiumBps" type="number" min="25" max="2500" defaultValue="500" required /></label></div>
            <label>qualifying severity rule<textarea name="severity" rows={2} defaultValue="CVSS >= 9.0 or explicitly classified CRITICAL" required /></label>
            <label>vulnerability class<textarea name="class" rows={2} defaultValue="remote code execution" required /></label>
            <label>exclusions<textarea name="exclusions" rows={3} defaultValue="local-admin-only, development-only dependency, unsupported fork" required /></label>
            <div className="form-pair"><label>coverage closes<input name="coverageClose" type="datetime-local" required /></label><label>warranty ends<input name="end" type="datetime-local" required /></label></div>
            <div className="form-triple"><label>incident window (sec)<input name="incidentWindow" type="number" defaultValue="3600" min="900" required /></label><label>min sources<input name="minSources" type="number" defaultValue="2" min="2" max="12" required /></label><label>min families<input name="minFamilies" type="number" defaultValue="2" min="2" max="6" required /></label></div>
            <label>evidence bond (GEN)<input name="evidenceBond" inputMode="decimal" defaultValue="0.001" required /></label>
            <button className="button button-dark">open funded warranty</button>
          </form>
        </article>
      </section>
      <TxRail state={tx} />
    </div>
  );
}
