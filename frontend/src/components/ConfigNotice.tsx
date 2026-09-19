"use client";

import { Faultline } from "@/lib/genlayer/faultline";

export function ConfigNotice() {
  if (Faultline.configured()) return null;
  return (
    <div className="config-notice">
      <strong>deployment not wired yet</strong>
      <span>set NEXT_PUBLIC_FAULTLINE_CONTRACT after the 61999 deployment. No mock chain state is shown.</span>
    </div>
  );
}
