import Link from "next/link";
import {Footer, Header} from "../components/Chrome";

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
            List a node
          </Link>
          <Link href="/#how" className="btn btn-ghost">
            See the method
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

const STEPS = [
  {
    n: "01",
    title: "Read what it earned",
    body:
      "Point Uptime at the address a node is paid to. It reads the transfers straight from " +
      "the chain and derives every figure by arithmetic: monthly totals, volatility, the " +
      "longest silence, the trend. Nobody is asked to be believed.",
  },
  {
    n: "02",
    title: "Two agents argue",
    body:
      "One represents the operator and argues for the highest price the record supports. " +
      "The other holds the shares if the node goes dark, and argues for the lowest. A third " +
      "reads both and decides what a share is worth.",
  },
  {
    n: "03",
    title: "Shares, and the revenue that follows",
    body:
      "Buyers take shares at the priced rate. Earnings delivered to the vault become " +
      "claimable pro rata, and stay correct even when shares change hands between payouts.",
  },
];

function Method() {
  return (
    <section id="how" className="wrap" style={{paddingTop: 96}}>
      <SectionRule label="Method" />

      <h2 className="display display-lg" style={{maxWidth: "18ch"}}>
        Evidence first, opinion second
      </h2>

      <div
        style={{
          marginTop: 44,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
          gap: 1,
          background: "var(--line)",
          border: "1px solid var(--line)",
        }}
      >
        {STEPS.map((step) => (
          <div key={step.n} style={{background: "var(--paper)", padding: "26px 24px 30px"}}>
            <p className="mono spec-red" style={{fontSize: 12, letterSpacing: "0.2em"}}>
              {step.n}
            </p>
            <h3 style={{marginTop: 14, fontSize: 20, letterSpacing: "-0.02em"}}>{step.title}</h3>
            <p style={{marginTop: 11, fontSize: 15, color: "var(--ink-70)", lineHeight: 1.6}}>
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------------------
 * Why the debate is real
 * ------------------------------------------------------------------------------------ */

function Asymmetry() {
  return (
    <section className="wrap" style={{paddingTop: 96}}>
      <SectionRule label="The asymmetry" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 44,
          alignItems: "start",
        }}
      >
        <div>
          <h2 className="display display-lg" style={{maxWidth: "16ch"}}>
            Two models agree unless you stop them
          </h2>
          <p className="lead" style={{marginTop: 20, fontSize: 16}}>
            Give two language models the same task and the same information and they will reach
            the same answer nearly every time. You get something debate-shaped with no
            disagreement inside it.
          </p>
          <p className="lead" style={{marginTop: 14, fontSize: 16}}>
            So they are not given the same information. The investor works from a risk
            checklist. The operator&rsquo;s advocate never sees it, and is never told it exists.
            The disagreement is structural, not instructed.
          </p>
        </div>

        <div className="plate">
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
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------------------
 * On chain
 * ------------------------------------------------------------------------------------ */

const COMMITMENTS = [
  {
    label: "sourceHash",
    body:
      "A fingerprint of the exact earnings history the agents read, so a later claim about " +
      "what a node was earning can be checked against what was actually seen at the time.",
  },
  {
    label: "verdictHash",
    body:
      "A fingerprint of the reasoning that produced the price. It cannot be quietly " +
      "rewritten once shares have sold.",
  },
  {
    label: "recordValuation",
    body:
      "Restricted to the valuation service. An operator pricing their own node is the " +
      "failure this design prevents.",
  },
];

function OnChain() {
  return (
    <section className="wrap" style={{paddingTop: 96}}>
      <SectionRule label="On chain" />

      <h2 className="display display-lg" style={{maxWidth: "20ch"}}>
        The chain is the oracle
      </h2>

      <p className="lead" style={{marginTop: 20}}>
        Tokenise a building or an invoice and you need someone trustworthy to swear the real
        thing did what it claimed. That person is the weak link. A node&rsquo;s earnings are
        already an on-chain event, so there is nobody to trust and nothing to attest.
      </p>

      <div
        style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 28,
        }}
      >
        {COMMITMENTS.map((c) => (
          <div key={c.label}>
            <p className="mono" style={{fontSize: 13, color: "var(--vermilion)"}}>
              {c.label}
            </p>
            <div className="rule" style={{margin: "10px 0 12px"}} />
            <p style={{fontSize: 14.5, color: "var(--ink-70)", lineHeight: 1.6}}>{c.body}</p>
          </div>
        ))}
      </div>

      <div style={{marginTop: 48}}>
        <Link href="/node" className="btn">
          List a node
        </Link>
      </div>
    </section>
  );
}

function SectionRule({label}: {label: string}) {
  return (
    <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 26}}>
      <p className="spec">{label}</p>
      <div className="rule" style={{flex: 1}} />
    </div>
  );
}
