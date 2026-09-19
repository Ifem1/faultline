import Link from "next/link";
import type { WarrantyRecord } from "@/lib/types";
import { formatDate, genFromAtto } from "@/lib/format";
import { Status } from "./Status";

export function WarrantyCard({ warranty, index }: { warranty: WarrantyRecord; index: number }) {
  const remaining = BigInt(warranty.bond_atto || 0) - BigInt(warranty.total_coverage_atto || 0);
  return (
    <Link href={`/warranties/${warranty.warranty_id}`} className="warranty-card">
      <div className="card-index">{String(index + 1).padStart(2, "0")}</div>
      <div className="card-main">
        <div className="card-topline"><Status value={warranty.status} /><span>{warranty.package_name || warranty.release_id}</span></div>
        <h3>{warranty.title}</h3>
        <div className="version-ribbon"><span>{warranty.version || "release"}</span><b>{genFromAtto(warranty.bond_atto)} GEN bond</b></div>
      </div>
      <div className="card-metrics">
        <div><span>coverage</span><b>{genFromAtto(warranty.total_coverage_atto)} GEN</b></div>
        <div><span>capacity</span><b>{genFromAtto(remaining)} GEN</b></div>
        <div><span>ends</span><b>{formatDate(warranty.ends_at)}</b></div>
      </div>
      <div className="card-arrow">↗</div>
    </Link>
  );
}
