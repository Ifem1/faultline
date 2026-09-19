"use client";

import { useWallet } from "@/lib/genlayer/wallet";
import { shortAddress } from "@/lib/format";

export function WalletButton() {
  const wallet = useWallet();
  if (wallet.loading) return <button className="wallet-button" disabled>checking wallet</button>;
  if (!wallet.connected) return <button className="wallet-button" onClick={() => wallet.connect()}>connect wallet</button>;
  if (!wallet.correctNetwork) return <button className="wallet-button wallet-warn" onClick={() => wallet.switchNetwork()}>switch to 61999</button>;
  return (
    <button className="wallet-button wallet-live" onClick={wallet.disconnect} title="Disconnect local session">
      <span className="signal-dot" /> {shortAddress(wallet.address)}
    </button>
  );
}
