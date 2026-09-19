import Link from "next/link";
import { Mark } from "@/components/Mark";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid hero-grid-left">
          <span className="hero-kicker">software risk, with collateral</span>
          <h1><span>ship with</span><strong>something</strong><span>behind the</span><strong>promise.</strong></h1>
          <p>Publishers bond GEN behind an exact release warranty. If a security advisory appears, GenLayer validators read the evidence and the bond settles only on the finalized result.</p>
          <div className="hero-actions">
            <Link href="/warranties" className="button button-dark">browse warranties <i>↗</i></Link>
            <Link href="/open" className="button button-clear">underwrite a release</Link>
          </div>
        </div>
        <div className="hero-grid hero-grid-right">
          <div className="fault-poster">
            <div className="poster-top"><Mark /><span>STUDIONET<br/>61999</span></div>
            <svg className="fault-trace" viewBox="0 0 420 560" aria-hidden="true">
              <path d="M254 -10 L238 74 L271 123 L218 190 L246 247 L181 311 L207 371 L151 421 L172 487 L130 570" />
              <path className="echo" d="M299 -10 L280 75 L311 130 L260 197 L289 255 L228 320 L251 380 L198 433 L217 495 L180 570" />
            </svg>
            <div className="poster-copy">
              <span>01 / warranty</span><b>immutable terms</b>
              <span>02 / evidence</span><b>public sources</b>
              <span>03 / consensus</span><b>semantic verdict</b>
              <span>04 / settlement</span><b>bond moves</b>
            </div>
          </div>
        </div>
      </section>

      <section className="manifesto-strip">
        <span>NO ORACLE OPERATOR</span><span>NO PRIVATE BACKEND</span><span>NO “AI SAYS SO”</span><span>FINALIZED STATE ONLY</span>
      </section>

      <section className="home-thesis">
        <div className="thesis-number">01</div>
        <div className="thesis-title"><span className="eyebrow">the fault</span><h2>A promise is cheap until breaking it costs something.</h2></div>
        <div className="thesis-copy"><p>Faultline turns a release guarantee into an on-chain warranty. Coverage closes before incidents can open. The publisher cannot rewrite the terms after a vulnerability appears.</p></div>
      </section>

      <section className="three-cuts">
        <article><span className="cut-no">A</span><h3>freeze the release</h3><p>Package, version, release digest, severity rule, vulnerability class, exclusions and corroboration thresholds are locked into the warranty.</p></article>
        <article><span className="cut-no">B</span><h3>examine the sources</h3><p>Each advisory is fetched and classified independently. Unavailable evidence is a retryable non-decision. Mirrors do not become independent corroboration.</p></article>
        <article><span className="cut-no">C</span><h3>let finality move the money</h3><p>A breach requires consistent evidence that the exact covered release satisfies every frozen condition. Only then does coverage become claimable.</p></article>
      </section>

      <section className="closing-panel">
        <div><span className="eyebrow">not insurance theatre</span><h2>One contract. Two consensus stages. Real GEN at risk.</h2></div>
        <Link href="/protocol" className="button button-acid">see the protocol <i>→</i></Link>
      </section>
    </>
  );
}
