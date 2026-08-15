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
    <section className="wrap" style={{paddingTop: 62, paddingBottom: 40}}>
      <h1 className="display display-xl rise" style={{maxWidth: "14ch"}}>
        Sell the earnings your machine has not made yet
      </h1>

      <p className="lead" style={{marginTop: 30}}>
        A node that earns twelve dollars a month is invisible to every lender alive. Uptime
        reads what it has actually paid out, has two AI agents argue over what the next six
        months are worth, and turns the answer into shares anyone can buy.
      </p>

      <div style={{display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap"}}>
        <Link href="/node" className="btn">
          List a node
        </Link>
        <Link href="/#how" className="btn btn-ghost">
          See the method
        </Link>
      </div>

      <Study />
    </section>
  );
}

/**
 * The performance study, composited from the reference art itself.
 *
 * These four PNGs are crops of the original painting, not redrawings of it. Every attempt
 * to reproduce that sheet in hand-written SVG came out as a diagram of the thing rather
 * than the thing, because the reference is continuous-tone painted art and code-drawn
 * vectors cannot be. So the pixels are the pixels, placed at the reference's own
 * proportions inside a fixed-ratio stage that scales as one image.
 *
 * The stage aspect and every position is locked to the source sheet. The crops carry the
 * sheet's paper in their corners, so each is edge-feathered into a background matched to
 * that paper; without the feather they read as pasted rectangles.
 *
 * The fans crop keeps a sliver of the card's right edge from the extraction, so the card
 * is layered above it and overlaps it by design.
 */
function Study() {
  return (
    <figure
      className="study"
      role="img"
      aria-label="Uptime performance study: a painted triple-fan compute card, followed by three wireframe fan studies in red, grey and blue, receding to the right."
    >
      {/* eslint-disable @next/next/no-img-element -- static art, no optimisation needed */}
      <img className="study-el feather" src="/study/fans.png" alt=""
        style={{left: "54.5%", top: "45.8%", width: "37.9%"}} />
      <img className="study-el feather" src="/study/card.png" alt=""
        style={{left: "5.5%", top: "43.5%", width: "50.6%", zIndex: 1}} />
      <img className="study-el feather" src="/study/mark.png" alt=""
        style={{left: "62%", top: "8.8%", width: "32.4%"}} />
      <img className="study-el feather" src="/study/label.png" alt=""
        style={{left: "85.3%", top: "42.2%", width: "11%"}} />
      {/* eslint-enable @next/next/no-img-element */}
    </figure>
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

          <table>
            <thead>
              <tr>
                <th>Node</th>
                <th>Operator</th>
                <th>Investor</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{color: "var(--ink)"}}>Steady, 124 days</td>
                <td>95%</td>
                <td>68%</td>
                <td style={{color: "var(--vermilion)", fontWeight: 600}}>70%</td>
              </tr>
              <tr>
                <td style={{color: "var(--ink)"}}>Decaying, hidden outage</td>
                <td>65%</td>
                <td>35%</td>
                <td style={{color: "var(--vermilion)", fontWeight: 600}}>48%</td>
              </tr>
            </tbody>
          </table>

          <p style={{marginTop: 20, fontSize: 14, color: "var(--ink-70)", lineHeight: 1.6}}>
            On the decaying node the arbiter put the real risk in one sentence, unprompted:
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
            Nothing stops the operator from switching this machine off once they have your
            money, so I&rsquo;m discounting the rate.
          </blockquote>
          <p style={{marginTop: 16, fontSize: 12.5, color: "var(--ink-50)", lineHeight: 1.6}}>
            Both nodes are fixtures with generated histories, labelled as such in the source.
            The rates are real output from the deployment you are reading this on, and both
            valuations are stored: fetch{" "}
            <span className="mono" style={{fontSize: 11.5}}>
              /api/valuation/0x7d8e1028…
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
      "failure this entire design exists to prevent.",
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
      <div className="crosshair" />
    </div>
  );
}
