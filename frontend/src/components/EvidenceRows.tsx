import type { EvidenceRecord } from "@/lib/types";
import { Status } from "./Status";

export function EvidenceRows({ evidence }: { evidence: EvidenceRecord[] }) {
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
          {item.basis ? <p>{item.basis}</p> : null}
        </div>
      ))}
    </div>
  );
}
