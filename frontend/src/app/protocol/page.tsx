import Link from "next/link";
import { PageHead } from "@/components/PageHead";

const stages = [
  ["01", "release", "A publisher registers an exact software release and its digest."],
  ["02", "warranty", "The publisher escrows GEN behind frozen breach terms and coverage capacity."],
  ["03", "coverage", "Users buy coverage before the coverage window closes. Once an incident is live, new coverage is blocked."],
  ["04", "evidence", "Contributors commit then reveal public sources. The first consensus stage fetches and classifies each source."],
  ["05", "judgment", "A second consensus stage applies only verified evidence to the frozen warranty."],
  ["06", "settlement", "BREACHED creates a payout reserve. NOT_AFFECTED leaves the warranty open. INCONCLUSIVE moves no warranty money."],
];

export default function ProtocolPage() {
  return (
    <div className="page-wrap">
      <PageHead eyebrow="protocol anatomy" title="How the money crosses the fault" body="Faultline uses one Intelligent Contract so semantic results and settlement live inside one accounting domain. The complexity is staged, not scattered across deployment boundaries." />
      <section className="protocol-map">
        <div className="protocol-spine" />
        {stages.map(([n, title, body]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></article>)}
      </section>
      <section className="protocol-rules">
        <div><span className="eyebrow">verdict semantics</span><h2>Three outcomes. Only one pays.</h2></div>
        <div className="rule-grid">
          <article className="rule-breach"><b>BREACHED</b><p>The exact release is affected, severity and class qualify, exclusions do not apply, and the verified evidence is consistent.</p></article>
          <article><b>NOT_AFFECTED</b><p>Consistent evidence establishes that at least one required warranty condition is false for the exact release.</p></article>
          <article><b>INCONCLUSIVE</b><p>Evidence conflicts or is insufficient. The incident stays open. No payout and no exoneration.</p></article>
        </div>
      </section>
      <section className="protocol-note"><strong>source unavailable ≠ not affected</strong><p>Unavailable sources are recorded as retryable non-decisions. LLM output must pass typed normalization and independent validator replay over substantive decision fields.</p><Link href="/warranties">inspect live state →</Link></section>
    </div>
  );
}
