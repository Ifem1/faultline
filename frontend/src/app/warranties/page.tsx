"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/PageHead";
import { WarrantyCard } from "@/components/WarrantyCard";
import { ConfigNotice } from "@/components/ConfigNotice";
import { EmptyState, LoadState } from "@/components/LoadState";
import { Faultline } from "@/lib/genlayer/faultline";
import type { WarrantyRecord } from "@/lib/types";

export default function WarrantiesPage() {
  const [items, setItems] = useState<WarrantyRecord[]>([]);
  const [loading, setLoading] = useState(Faultline.configured());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Faultline.configured()) return;
    Faultline.listWarranties().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap">
      <PageHead eyebrow="live market" title="Release warranties" body="Every row is finalized contract state. Coverage capacity is the publisher bond minus coverage already issued." aside="No mock market data is rendered when the deployment is not configured." />
      <ConfigNotice />
      {loading ? <LoadState /> : null}
      {error ? <div className="error-box">{error}</div> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="no warranties yet" body="Register a release and open the first bonded warranty." /> : null}
      <div className="warranty-list">{items.map((item, index) => <WarrantyCard key={item.warranty_id} warranty={item} index={index} />)}</div>
    </div>
  );
}
