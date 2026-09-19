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

function usefulError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  try {
    const encoded = JSON.stringify(error);
    if (encoded && encoded !== "{}") return encoded;
  } catch {
    // Fall through to a stable user-facing message.
  }
  return "GenLayer transaction failed.";
}

function txStatus(transaction: any) {
  return transaction?.statusName ?? String(transaction?.status ?? "unknown");
}

function executionStatus(transaction: any) {
  return transaction?.txExecutionResultName ?? String(transaction?.txExecutionResult ?? "unknown");
}

// genlayer-js 1.1.8 on npm does not yet export the upstream isSuccessful helper.
// Match its published-upstream semantics locally: accepted/finalized AND FINISHED_WITH_RETURN.
function executionSucceeded(transaction: any) {
  const status = transaction?.statusName ?? transaction?.status;
  const execution = transaction?.txExecutionResultName ?? transaction?.txExecutionResult;
  const accepted =
    status === TransactionStatus.ACCEPTED ||
    status === TransactionStatus.FINALIZED ||
    status === 5 ||
    status === 7 ||
    status === "5" ||
    status === "7";
  const returned =
    execution === "FINISHED_WITH_RETURN" ||
    execution === 1 ||
    execution === "1";
  return accepted && returned;
}

async function executeWrite(
  account: `0x${string}`,
  functionName: string,
  args: any[],
  value: bigint,
  onState?: (state: TxState) => void
) {
  if (!CONTRACT_ADDRESS) throw new Error("Faultline contract address is not configured.");

  let hash: `0x${string}` | undefined;
  try {
    const client: any = await writeClient(account);
    const write = { address: CONTRACT_ADDRESS as `0x${string}`, functionName, args, value };

    onState?.({ stage: "signing", message: "Confirm this transaction in your injected wallet." });
    const fees = await estimateWriteFees(client, write as any);
    hash = await client.writeContract({ ...write, ...(fees ? { fees } : {}) } as any);
    onState?.({ stage: "submitted", hash, message: "Submitted to GenLayer consensus." });

    const decision = await client.waitForTransactionReceipt({
      hash,
      waitUntil: "decided",
      retries: 120,
      interval: 4000,
      fullTransaction: true,
    });

    const decisionName = decision?.statusName;
    if (
      decisionName &&
      decisionName !== TransactionStatus.ACCEPTED &&
      decisionName !== TransactionStatus.FINALIZED
    ) {
      throw new Error(`Consensus ended in ${decisionName}; the operation was not accepted.`);
    }

    onState?.({
      stage: "decided",
      hash,
      message: `Consensus decision reached (${txStatus(decision)}).`,
    });
    onState?.({ stage: "finalizing", hash, message: "Accepted decision reached; waiting for finality." });

    const finalReceipt =
      decisionName === TransactionStatus.FINALIZED
        ? decision
        : await client.waitForTransactionReceipt({
            hash,
            waitUntil: "finalized",
            retries: 180,
            interval: 4000,
            fullTransaction: true,
          });

    if (!executionSucceeded(finalReceipt)) {
      throw new Error(
        `Transaction reached ${txStatus(finalReceipt)} but execution was not successful (${executionStatus(finalReceipt)}).`
      );
    }

    onState?.({
      stage: "successful",
      hash,
      message: "Finalized with successful GenVM execution.",
    });
    return hash;
  } catch (error) {
    const message = usefulError(error);
    onState?.({ stage: "error", ...(hash ? { hash } : {}), message });
    const wrapped = new Error(message) as Error & { hash?: `0x${string}` };
    if (hash) wrapped.hash = hash;
    throw wrapped;
  }
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
