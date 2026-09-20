"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Faultline, SOURCE_FAMILIES } from "@/lib/genlayer/faultline";
import { latestFinalRead } from "@/lib/genlayer/client";
import { useWallet } from "@/lib/genlayer/wallet";
import type { EvidenceRecord, IncidentRecord, ReleaseRecord, TxState, WarrantyRecord } from "@/lib/types";
import { formatDateTime, genFromAtto } from "@/lib/format";
import { Status } from "@/components/Status";
import { EvidenceRows } from "@/components/EvidenceRows";
import { TxRail } from "@/components/TxRail";
import { ConfigNotice } from "@/components/ConfigNotice";
import { LoadState } from "@/components/LoadState";

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

type PendingReveal = {
  commitment: string;
  incidentId: string;
  family: string;
  url: string;
  fact: string;
  salt: string;
  evidenceId?: string;
};

export default function IncidentDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const wallet = useWallet();
  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [warranty, setWarranty] = useState<WarrantyRecord | null>(null);
  const [release, setRelease] = useState<ReleaseRecord | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [evidenceTotal, setEvidenceTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tx, setTx] = useState<TxState>({ stage: "idle" });
  const [loading, setLoading] = useState(Faultline.configured());
  const [error, setError] = useState("");
  const [pendingReveals, setPendingReveals] = useState<PendingReveal[]>([]);
  const [nowSeconds, setNowSeconds] = useState(() => Math.floor(Date.now() / 1000));

  const refresh = useCallback(async () => {
    if (!Faultline.configured()) return;
    const i = await Faultline.incident(id);
    const w = await Faultline.warranty(i.warranty_id);
    const [r, page] = await Promise.all([Faultline.release(w.release_id), Faultline.evidence(id)]);
    setIncident(i); setWarranty(w); setRelease(r); setEvidence(page.items); setEvidenceTotal(Number(page.total));
  }, [id]);

  useEffect(() => { refresh().catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [refresh]);
  useEffect(() => {
    const timer = window.setInterval(() => setNowSeconds(Math.floor(Date.now() / 1000)), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const rows: PendingReveal[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith("faultline.reveal.")) continue;
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}") as Omit<PendingReveal, "commitment">;
        if (data.incidentId !== id) continue;
        const commitment = key.slice("faultline.reveal.".length);
        const match = evidence.find((item) => item.commitment === commitment);
        rows.push({ commitment, ...data, evidenceId: match?.evidence_id });
      } catch {
        // Ignore malformed local recovery entries instead of deleting them automatically.
      }
    }
    setPendingReveals(rows);
  }, [id, evidence]);

  const familyCount = incident?.verified_family_count !== undefined
    ? Number(incident.verified_family_count)
    : new Set(evidence.filter(e => e.status === "VERIFIED").map(e => e.source_family)).size;

  async function loadMoreEvidence() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await Faultline.evidence(id, evidence.length, 25);
      setEvidence((current) => [...current, ...page.items]);
      setEvidenceTotal(Number(page.total));
    } catch (e: any) {
      setError(e?.message || "Could not load the next evidence page.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function act(name: string, args: any[], value = 0n) {
    if (!wallet.address) { await wallet.connect(); return false; }
    if (!wallet.correctNetwork) { await wallet.switchNetwork(); return false; }
    setError("");
    try {
      await Faultline.write(wallet.address, name, args, value, setTx);
      await refresh();
      return true;
    } catch (e: any) {
      setTx({ stage: "error", hash: e?.hash, message: e?.message || "Transaction failed" });
      setError(e?.message || "Transaction failed");
      return false;
    }
  }

  async function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!wallet.address || !warranty) { await wallet.connect(); return; }
    const form = event.currentTarget;
    const data = new FormData(form);
    const family = String(data.get("family"));
    const url = String(data.get("url"));
    const fact = String(data.get("fact"));
    const salt = randomSalt();
    try {
      const commitment = String(await latestFinalRead("compute_evidence_commitment", [id, wallet.address, family, url, fact, salt]));
      localStorage.setItem(`faultline.reveal.${commitment}`, JSON.stringify({ incidentId: id, family, url, fact, salt }));
      const committed = await act("commit_evidence", [id, commitment], BigInt(warranty.evidence_bond_atto || 0));
      if (!committed) return;
      const page = await Faultline.evidence(id);
      const record = page.items.find((row) => row.commitment === commitment);
      if (!record) throw new Error("Commit finalized but its evidence record was not found. The reveal material is saved locally; refresh this incident to recover it.");
      const revealed = await act("reveal_evidence", [record.evidence_id, family, url, fact, salt]);
      if (revealed) {
        localStorage.removeItem(`faultline.reveal.${commitment}`);
        form.reset();
        await refresh();
      }
    } catch (e: any) {
      setError(e?.message || "Evidence submission failed");
    }
  }

  async function revealSaved(item: PendingReveal) {
    if (!item.evidenceId) {
      setError("The committed evidence record is not visible in finalized state yet. Refresh and try again.");
      return;
    }
    const ok = await act("reveal_evidence", [item.evidenceId, item.family, item.url, item.fact, item.salt]);
    if (ok) {
      localStorage.removeItem(`faultline.reveal.${item.commitment}`);
      await refresh();
    }
  }

  if (loading) return <div className="page-wrap"><LoadState /></div>;

  return (
    <div className="page-wrap">
      <ConfigNotice />
      {error ? <div className="error-box">{error}</div> : null}
      {incident && warranty && release ? (
        <>
          <section className="incident-hero">
            <div><div className="crumb"><Link href={`/warranties/${warranty.warranty_id}`}>{warranty.warranty_id}</Link><span>/</span><b>{incident.incident_id}</b></div><span className="eyebrow">incident file</span><h1>{incident.title}</h1><p>{release.package_name} <b>{release.version}</b> · {incident.advisory_hint}</p></div>
            <div className="incident-score"><Status value={incident.last_verdict || incident.status} /><strong>{incident.verified_count}</strong><span>verified sources</span><strong>{familyCount}</strong><span>source families</span></div>
          </section>

          <section className="decision-board">
            <div><span>active evidence capacity</span><b>{incident.evidence_capacity_used || "0"} / {incident.evidence_capacity_limit || "12"}</b></div>
            <div><span>historical submissions</span><b>{incident.evidence_count || "0"}</b></div>
            <div><span>evidence closes</span><b>{formatDateTime(incident.evidence_deadline)}</b></div>
            <div><span>required sources</span><b>{warranty.min_sources}</b></div>
            <div><span>required families</span><b>{warranty.min_source_families}</b></div>
            <div><span>evidence bond</span><b>{genFromAtto(warranty.evidence_bond_atto)} GEN</b></div>
            <div><span>rounds</span><b>{incident.adjudication_rounds || "0"}</b></div>
          </section>

          {incident.last_basis ? <section className="verdict-note"><span>latest consensus basis</span><p>{incident.last_basis}</p></section> : null}

          <section className="source-section">
            <div className="section-bar"><div><span className="eyebrow">source examiner</span><h2>Evidence, one source at a time</h2></div><button className="text-button" onClick={() => refresh()}>refresh finalized state ↻</button></div>
            {incident.status === "OPEN" && incident.evidence_deadline && nowSeconds < Number(incident.evidence_deadline) && Number(incident.evidence_capacity_remaining || 0) === 0 ? <p className="muted-line">All active slots are occupied. Retry becomes available when a non-verified result releases a slot.</p> : null}
            <EvidenceRows
              evidence={evidence}
              nowSeconds={nowSeconds}
              canRetry={incident.status === "OPEN" && nowSeconds < Number(incident.evidence_deadline || 0) && Number(incident.evidence_capacity_remaining || 0) > 0}
              onRetry={(evidenceId) => act("retry_evidence", [evidenceId])}
              onExpireUnrevealed={(evidenceId) => act("expire_unrevealed_evidence", [evidenceId])}
            />
            <div className="evidence-pagination"><span>showing {evidence.length} of {evidenceTotal} historical submissions</span>{evidence.length < evidenceTotal ? <button className="text-button" disabled={loadingMore} onClick={loadMoreEvidence}>{loadingMore ? "loading…" : "load next 25 →"}</button> : null}</div>
          </section>

          {incident.status === "OPEN" && incident.evidence_deadline && nowSeconds >= Number(incident.evidence_deadline) ? (
            <section className="terminal-actions"><div><span className="eyebrow">liveness fallback</span><h2>Close the expired evidence window.</h2><p>Expiring an incident records `EXPIRED` with `last_verdict = INCONCLUSIVE`. This is a timeout path, not semantic adjudication.</p></div><button className="button button-dark" onClick={() => act("expire_incident", [id])}>expire incident</button></section>
          ) : null}

          {pendingReveals.length > 0 ? (
            <section className="recovery-shelf">
              <div><span className="eyebrow">reveal recovery</span><h2>Committed locally, not yet revealed.</h2><p>These salts and source details never left this browser until reveal. Faultline does not resubmit a commitment automatically.</p></div>
              <div className="recovery-list">
                {pendingReveals.map((item) => (
                  <article key={item.commitment}>
                    <div><b>{item.family}</b><code>{item.commitment.slice(0, 12)}…{item.commitment.slice(-8)}</code><small>{item.url}</small></div>
                    <button className="button button-dark" disabled={!item.evidenceId} onClick={() => revealSaved(item)}>{item.evidenceId ? "reveal saved evidence" : "waiting for finalized commit"}</button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {incident.status === "OPEN" ? (
            <section className="evidence-submit">
              <div className="action-copy"><span className="eyebrow">add evidence</span><h2>Commit first. Reveal after finality.</h2><p>The source URL and fact stay hidden until the commitment is anchored. A verified source gets its bond back. Unavailable sources are retryable. Irrelevant sources can lose the evidence bond.</p></div>
              <form className="stack-form" onSubmit={submitEvidence}>
                <label>source family<select name="family" required>{SOURCE_FAMILIES.map(f => <option key={f}>{f}</option>)}</select></label>
                <label>https source URL<input name="url" type="url" placeholder="https://…" required /></label>
                <label>what this source establishes<textarea name="fact" rows={3} placeholder="The advisory states that 3.7.4 is affected…" required /></label>
                <button className="button button-acid">commit + reveal evidence</button>
              </form>
            </section>
          ) : null}

          {incident.status === "OPEN" ? (
            <section className="adjudicate-panel"><div><span className="eyebrow">warranty judge</span><h2>Ready when corroboration is real.</h2><p>{incident.verified_count}/{warranty.min_sources} verified sources · {familyCount}/{warranty.min_source_families} source families</p></div><button className="button button-dark" onClick={() => act("adjudicate_incident", [id])}>run adjudication</button></section>
          ) : null}
          <TxRail state={tx} />
        </>
      ) : <div className="empty-state"><h3>incident unavailable</h3><p>{error || "This incident could not be read from finalized state."}</p></div>}
    </div>
  );
}
