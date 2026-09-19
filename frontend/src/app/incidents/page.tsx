"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHead } from "@/components/PageHead";
import { ConfigNotice } from "@/components/ConfigNotice";
import { Faultline } from "@/lib/genlayer/faultline";
import type { IncidentRecord, WarrantyRecord } from "@/lib/types";
import { Status } from "@/components/Status";
import { formatDateTime } from "@/lib/format";
import { EmptyState, LoadState } from "@/components/LoadState";

export default function IncidentsPage() {
  const [rows, setRows] = useState<Array<IncidentRecord & { warrantyTitle: string }>>([]);
  const [loading, setLoading] = useState(Faultline.configured());

  useEffect(() => {
    if (!Faultline.configured()) return;
    (async () => {
      const warranties = await Faultline.listWarranties();
      const groups = await Promise.all(warranties.map(async (w: WarrantyRecord) => (await Faultline.incidents(w.warranty_id)).map(i => ({ ...i, warrantyTitle: w.title }))));
      setRows(groups.flat().reverse());
    })().finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap">
      <PageHead eyebrow="adjudication desk" title="Incidents" body="An incident is a live question against one frozen warranty. Evidence can be added until the incident deadline. Inconclusive is not a loss and not an exoneration." />
      <ConfigNotice />
      {loading ? <LoadState /> : null}
      {!loading && rows.length === 0 ? <EmptyState title="no incidents" body="Incidents appear here after a warranty’s coverage window closes." /> : null}
      <div className="incident-ledger">
        {rows.map((row) => (
          <Link href={`/incidents/${row.incident_id}`} key={row.incident_id} className="incident-ledger-row">
            <span className="ledger-id">{row.incident_id}</span>
            <div><b>{row.title}</b><small>{row.warrantyTitle}</small></div>
            <div><span>verified</span><b>{row.verified_count}</b></div>
            <div><span>opened</span><b>{formatDateTime(row.opened_at)}</b></div>
            <Status value={row.last_verdict || row.status} />
            <i>↗</i>
          </Link>
        ))}
      </div>
    </div>
  );
}
