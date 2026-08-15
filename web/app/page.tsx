import Link from "next/link";
import {Footer, Header} from "../components/Chrome";
import {AgreementStudy, OracleStudy, ProjectionStudy} from "../components/Study";
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
    <section className="hero">
      {/*
        The study sits behind the headline rather than beside it. Held well back: the card
        is nearly black and the headline is dark ink, so at full strength the two fight and
        the words lose. Faded, masked at the edges and washed through the centre, it reads
        as the paper the page is printed on rather than as a picture with text on top.
      */}
      <div className="hero-art" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          // The png is the fallback for anything that cannot read srcset or webp. Every
          // current browser takes a webp from the srcset instead and never fetches it.
          src="/study/study.png"
          srcSet="/study/study-760.webp 760w, /study/study-1200.webp 1200w, /study/study-1877.webp 1877w"
          // The art is drawn wider than the viewport on purpose, so the browser must be told
          // that; left to its own devices it assumes 100vw and pulls a file too small for the
          // width it is actually painted at.
          sizes="(max-width: 900px) 150vw, 138vw"
          alt=""
          width={1877}
          height={431}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="wrap hero-copy">
        <h1 className="display display-xl rise">Sell the earnings your machine has not made yet</h1>

        <p className="lead hero-lead">
          A node that earns twelve dollars a month is invisible to every lender alive. Uptime
          reads what it has actually paid out, has two AI agents argue over what the next six
          months are worth, and turns the answer into shares anyone can buy.
        </p>

        <div className="hero-actions">
          <Link href="/node" className="btn">
            Value a node
          </Link>
        </div>
      </div>

      <p className="sr-only">
        Uptime performance study: a triple-fan compute card followed by three wireframe fan
        studies in red, grey and blue, receding to the right.
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
        <ProjectionStudy />
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
          <AgreementStudy />
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

      <Reveal delay={120}>
        <OracleStudy />
      </Reveal>

      <div style={{marginTop: 48}}>
        <Link href="/node" className="btn">
          Value a node
        </Link>
      </div>
    </section>
  );
}
