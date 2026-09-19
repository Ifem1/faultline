import Link from "next/link";
import { contractExplorer } from "@/lib/genlayer/client";

export function Footer() {
  return (
    <footer className="footer">
      <div><strong>FAULTLINE</strong><span>bonded release warranties on GenLayer</span></div>
      <div className="footer-links">
        <Link href="/protocol">protocol</Link>
        <a href={contractExplorer()} target="_blank" rel="noreferrer">studionet explorer ↗</a>
        <span>chain 61999</span>
      </div>
    </footer>
  );
}
