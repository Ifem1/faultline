import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionHashVariant } from "genlayer-js/types";

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999");
export const CHAIN_HEX = `0x${CHAIN_ID.toString(16)}`;
export const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
export const EXPLORER_URL = process.env.NEXT_PUBLIC_GENLAYER_EXPLORER || "https://explorer-studio.genlayer.com";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FAULTLINE_CONTRACT || "";

if (CHAIN_ID !== 61999) {
  throw new Error("Faultline is configured exclusively for GenLayer Studionet (61999).");
}
if (RPC_URL !== "https://studio.genlayer.com/api") {
  throw new Error("Faultline requires the official GenLayer Studionet RPC endpoint.");
}

export type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] | object }): Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function provider() {
  return typeof window !== "undefined" ? window.ethereum || null : null;
}

export function readClient() {
  return createClient({ chain: studionet, endpoint: RPC_URL });
}

export async function writeClient(address: `0x${string}`) {
  const injected = provider();
  if (!injected) throw new Error("No injected EIP-1193 wallet was found.");
  const client: any = createClient({
    chain: studionet,
    account: address,
    provider: injected as any,
    endpoint: RPC_URL
  } as any);
  if (typeof client.connect === "function") {
    await client.connect("studionet");
  }
  return client;
}

export async function latestFinalRead(functionName: string, args: any[] = []) {
  if (!CONTRACT_ADDRESS) throw new Error("Faultline contract address is not configured.");
  return readClient().readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName,
    args,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL
  });
}

export function contractExplorer() {
  return CONTRACT_ADDRESS ? `${EXPLORER_URL}/address/${CONTRACT_ADDRESS}` : EXPLORER_URL;
}

export function transactionExplorer() {
  return `${EXPLORER_URL}/txs`;
}
