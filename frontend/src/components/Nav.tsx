"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./Mark";
import { WalletButton } from "./WalletButton";

const links = [
  ["/warranties", "warranties"],
  ["/incidents", "incidents"],
  ["/open", "open"],
  ["/protocol", "protocol"],
  ["/account", "account"]
] as const;

export function Nav() {
  const path = usePathname();
  return (
    <header className="site-nav">
      <Link href="/" className="brand-link"><Mark compact /><span>FAULTLINE</span></Link>
      <nav className="nav-links">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={path.startsWith(href) ? "active" : ""}>{label}</Link>
        ))}
      </nav>
      <WalletButton />
    </header>
  );
}
