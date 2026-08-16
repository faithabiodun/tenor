import Link from "next/link";
import {Footer, Header} from "../components/Chrome";
import {StudySequence} from "../components/Study";
import {Reveal} from "../components/Reveal";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Method />
        <Asymmetry />
        <OnChain />
      </main>
      <Footer />
    </>
  );
}

/* --------------------------------------------------------------------------------------
 * Hero
 * ------------------------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="showcase">
      {/* The product sheet, dark: the machine is the subject and everything else is
          arranged around it, the way a product page arranges itself around the thing
          being sold. What is being sold here is the machine's next six months. */}
      <nav className="showcase-nav" aria-label="Sections">
        <Link href="/node" className="is-on">
          Value a node
        </Link>
        <Link href="/#how">Method</Link>
        <Link href="/#chain">On chain</Link>
      </nav>

      <div className="showcase-grid">
        <div className="showcase-copy">
          <h1 className="display showcase-title">
            Sell the earnings
            <br />
            your machine
            <br />
            has not made yet
          </h1>
          <p>
            A node that earns twelve dollars a month is invisible to every lender alive.
            Uptime reads what it has actually paid out, has two AI agents argue over what the
            next six months are worth, and turns the answer into shares anyone can buy.
          </p>
          <Link href="/node" className="showcase-cta">
            Value a node <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Floating rather than sitting: the machine is the hero of the page. */}
        <div className="showcase-art" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/study/study.png"
            srcSet="/study/study-760.webp 760w, /study/study-1200.webp 1200w, /study/study-1877.webp 1877w"
            sizes="(max-width: 900px) 96vw, 52vw"
            alt=""
            width={1877}
            height={431}
            fetchPriority="high"
          />
        </div>

        {/* The figures a buyer actually decides on, in the slot a product page gives price. */}
        <aside className="showcase-spec">
          <p className="showcase-score">
            84<span>/100</span>
          </p>
          <p className="showcase-label">Node score, priced live</p>

          <p className="showcase-price">62%</p>
          <p className="showcase-label">of projected term earnings</p>

          <p className="showcase-label" style={{marginTop: 22}}>Term</p>
          <div className="showcase-chips">
            <span className="is-on">6 mo</span>
            <span>12 mo</span>
            <span>24 mo</span>
          </div>
        </aside>
      </div>

      <p className="showcase-foot">
        Evidence first,
        <br />
        opinion second
      </p>

      <p className="sr-only">
        Uptime performance study: a triple-fan compute card followed by three wireframe fan
        studies receding to the right.
      </p>
    </section>
  );
}

/* --------------------------------------------------------------------------------------
 * Method
 * ------------------------------------------------------------------------------------ */

function Method() {
  return (
    <section id="how" className="wrap beat">
      <Reveal>
        <h2 className="display display-lg beat-head">
          Infrastructure that earns, financed by what it earns
        </h2>
        <p className="beat-sub">
          A GPU rig, an inference server, an edge node. Real machines with real customers and
          a payout address anyone can read.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <StudySequence />
      </Reveal>
    </section>
  );
}

/* --------------------------------------------------------------------------------------
 * Why the debate is real
 * ------------------------------------------------------------------------------------ */

function Asymmetry() {
  return (
    <section className="wrap beat">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 44,
          alignItems: "start",
        }}
      >
        <Reveal>
          <h2 className="display display-lg beat-head" style={{maxWidth: "16ch"}}>
            Two models agree unless you stop them
          </h2>
          <p className="beat-sub">
            Give two models the same information and they agree. So only one of them is given
            the list of things that can go wrong.
          </p>
        </Reveal>

        <Reveal delay={140} className="plate">
          <p className="spec" style={{marginBottom: 18}}>
            Two sample nodes · same code, same day
          </p>

          {/* Four columns of tabular figures cannot shrink below their content, so on a
              narrow screen the table scrolls inside its own box rather than pushing the
              whole page sideways. */}
          <div className="scroll-x">
              <table>
                <thead>
                <tr>
                  <th>Node</th>
                  <th>Score</th>
                  <th>Operator</th>
                  <th>Investor</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{color: "var(--ink)"}}>Steady, 124 days</td>
                  <td>84</td>
                  <td>92%</td>
                  <td>50%</td>
                  <td style={{color: "var(--vermilion)", fontWeight: 600}}>62%</td>
                </tr>
                <tr>
                  <td style={{color: "var(--ink)"}}>Decaying, hidden outage</td>
                  <td>55</td>
                  <td>74%</td>
                  <td>10%</td>
                  <td style={{color: "var(--vermilion)", fontWeight: 600}}>30%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{marginTop: 20, fontSize: 14, color: "var(--ink-70)", lineHeight: 1.6}}>
            On the decaying node the investor reached the real risk unprompted:
          </p>
          <blockquote
            style={{
              margin: "12px 0 0",
              paddingLeft: 16,
              borderLeft: "2px solid var(--vermilion)",
              fontSize: 14.5,
              color: "var(--ink)",
              lineHeight: 1.55,
            }}
          >
            Net margin is thin and shrinking: 8.46 against operating costs of 5.20. Another
            38% drop makes the node unprofitable, and the operator has no obligation to keep
            it running once paid.
          </blockquote>
          <p style={{marginTop: 16, fontSize: 12.5, color: "var(--ink-50)", lineHeight: 1.6}}>
            Both nodes are fixtures with generated histories, labelled as such in the source.
            The rates are real output from this deployment, and both valuations are stored:
            fetch{" "}
            <span className="mono" style={{fontSize: 11.5}}>
              /api/valuation/0xc8f8d03d…
            </span>{" "}
            and re-hash the canonical JSON yourself.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------------------
 * On chain
 * ------------------------------------------------------------------------------------ */

function OnChain() {
  return (
    <section id="chain" className="wrap beat">
      <Reveal>
        <h2 className="display display-lg beat-head">The chain is the oracle</h2>
        <p className="beat-sub">
          Tokenise a building and somebody must swear it did what it claimed. A machine&rsquo;s
          earnings are already an event on the chain, so there is nobody to trust.
        </p>
      </Reveal>

      <div style={{marginTop: 48}}>
        <Link href="/node" className="btn">
          Value a node
        </Link>
      </div>
    </section>
  );
}
