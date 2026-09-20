import type { EvidenceRecord } from "@/lib/types";
import { Status } from "./Status";

export function EvidenceRows({
  evidence,
  nowSeconds,
  canRetry,
  onRetry,
  onExpireUnrevealed,
}: {
  evidence: EvidenceRecord[];
  nowSeconds: number;
  canRetry: boolean;
  onRetry: (id: string) => void;
  onExpireUnrevealed: (id: string) => void;
}) {
  return (
    <div className="evidence-table">
      <div className="evidence-head"><span>source</span><span>version</span><span>severity</span><span>class</span><span>result</span></div>
      {evidence.map((item) => (
        <div className="evidence-row" key={item.evidence_id}>
          <div><b>{item.source_family || "sealed"}</b><a href={item.source_url || undefined} target="_blank" rel="noreferrer">{item.advisory_id || item.source_url || item.evidence_id}</a></div>
          <div>{item.release_affected ? "affected" : "not established"}<small>{item.affected_range}</small></div>
          <div>{item.severity_qualifies ? "qualifies" : "not met"}</div>
          <div>{item.class_matches ? "matches" : "not met"}</div>
          <div><Status value={item.status} /></div>
          {item.status === "SOURCE_UNAVAILABLE" && canRetry ? <button className="text-button evidence-action" onClick={() => onRetry(item.evidence_id)}>retry evidence</button> : null}
          {item.status === "COMMITTED" && item.reveal_deadline && nowSeconds >= Number(item.reveal_deadline) ? <button className="text-button evidence-action" onClick={() => onExpireUnrevealed(item.evidence_id)}>expire unrevealed evidence</button> : null}
          {item.basis ? <p>{item.basis}</p> : null}
        </div>
      ))}
    </div>
  );
}
