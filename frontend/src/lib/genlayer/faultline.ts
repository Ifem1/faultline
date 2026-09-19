"use client";

import { CONTRACT_ADDRESS, latestFinalRead, writeClient } from "./client";
import { estimateWriteFees } from "./fees";
import { asPlain } from "@/lib/format";
import { TransactionStatus } from "genlayer-js/types";
import type { EvidenceRecord, IncidentRecord, ReleaseRecord, TxState, WarrantyRecord } from "@/lib/types";

export const SOURCE_FAMILIES = [
  "VENDOR",
  "GITHUB_ADVISORY",
  "NVD",
  "CISA",
  "PACKAGE_REGISTRY",
  "SECURITY_RESEARCH"
] as const;

async function executeWrite(
  account: `0x${string}`,
  functionName: string,
  args: any[],
  value: bigint,
  onState?: (state: TxState) => void
) {
  if (!CONTRACT_ADDRESS) throw new Error("Faultline contract address is not configured.");
  const client: any = await writeClient(account);
  const write = { address: CONTRACT_ADDRESS as `0x${string}`, functionName, args, value };
  onState?.({ stage: "signing", message: "Confirm in your wallet" });
  const fees = await estimateWriteFees(client, write as any);
  const hash = await client.writeContract({ ...write, ...(fees ? { fees } : {}) } as any);
  onState?.({ stage: "submitted", hash, message: "Submitted to GenLayer consensus" });

  if (typeof client.waitForDecision === "function") {
    await client.waitForDecision({ hash });
  } else {
    await client.waitForTransactionReceipt({
      hash,
      status: TransactionStatus.ACCEPTED,
      retries: 120,
      interval: 4000,
    });
  }
  onState?.({ stage: "decided", hash, message: "Decision materialized; waiting for finality" });

  if (typeof client.waitForFinalization === "function") {
    await client.waitForFinalization({ hash });
  } else {
    await client.waitForTransactionReceipt({
      hash,
      status: TransactionStatus.FINALIZED,
      retries: 180,
      interval: 4000,
    });
  }
  onState?.({ stage: "finalized", hash, message: "Finalized" });
  return hash as `0x${string}`;
}

export const Faultline = {
  configured: () => !!CONTRACT_ADDRESS,

  async listWarranties(): Promise<WarrantyRecord[]> {
    const raw = asPlain<any>(await latestFinalRead("list_warranties", [0, 25]));
    return (raw?.items || []) as WarrantyRecord[];
  },

  async listReleases(): Promise<ReleaseRecord[]> {
    const raw = asPlain<any>(await latestFinalRead("list_releases", [0, 25]));
    return (raw?.items || []) as ReleaseRecord[];
  },

  async warranty(id: string): Promise<WarrantyRecord> {
    return asPlain<WarrantyRecord>(await latestFinalRead("get_warranty", [id]));
  },

  async release(id: string): Promise<ReleaseRecord> {
    return asPlain<ReleaseRecord>(await latestFinalRead("get_release", [id]));
  },

  async incidents(warrantyId: string): Promise<IncidentRecord[]> {
    return asPlain<IncidentRecord[]>(await latestFinalRead("list_incidents", [warrantyId]));
  },

  async incident(id: string): Promise<IncidentRecord> {
    return asPlain<IncidentRecord>(await latestFinalRead("get_incident", [id]));
  },

  async evidence(incidentId: string): Promise<EvidenceRecord[]> {
    return asPlain<EvidenceRecord[]>(await latestFinalRead("list_evidence", [incidentId]));
  },

  async stats() {
    return asPlain<Record<string, any>>(await latestFinalRead("get_stats", []));
  },

  async credit(address: string) {
    return String(await latestFinalRead("get_credit", [address]));
  },

  async coverage(warrantyId: string, address: string) {
    return asPlain<any>(await latestFinalRead("get_coverage", [warrantyId, address]));
  },

  write: (account: `0x${string}`, name: string, args: any[], value = 0n, onState?: (state: TxState) => void) =>
    executeWrite(account, name, args, value, onState)
};
