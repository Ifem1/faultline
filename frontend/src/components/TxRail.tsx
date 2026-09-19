"use client";

import type { TxState } from "@/lib/types";
import { transactionExplorer } from "@/lib/genlayer/client";

const stages = ["signing", "submitted", "decided", "finalizing", "successful"] as const;

export function TxRail({ state }: { state: TxState }) {
  if (state.stage === "idle") return null;
  const at = stages.indexOf(state.stage as any);
  return (
    <div className={`tx-rail ${state.stage === "error" ? "tx-error" : ""}`}>
      <div className="tx-rail-top"><strong>{state.stage}</strong><span>{state.message}</span></div>
      {state.stage !== "error" ? (
        <div className="tx-steps">
          {stages.map((stage, index) => <span key={stage} className={index <= at ? "done" : ""}>{stage}</span>)}
        </div>
      ) : null}
      {state.hash ? <a href={transactionExplorer(state.hash)} target="_blank" rel="noreferrer">{state.hash.slice(0, 12)}…{state.hash.slice(-8)} · explorer ↗</a> : null}
    </div>
  );
}
