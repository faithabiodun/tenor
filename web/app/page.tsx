import Link from "next/link";
import {Footer, Header} from "../components/Chrome";
import {Hardware} from "../components/Hardware";

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
      <div className="wrap">
        <div className="hero-grid">
          <div className="rise">
            <div style={{display: "flex", alignItems: "center", gap: 11, marginBottom: 20}}>
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "var(--vermilion)",
                  flex: "none",
                }}
              />
              <span className="spec">Relentless uptime</span>
              <span className="rule" style={{flex: 1, maxWidth: 120}} />
            </div>

            <h1
              className="display display-xl"
              style={{display: "flex", alignItems: "flex-start", gap: 8}}
            >
              Uptime
              <span
                aria-hidden
                style={{
                  width: "0.09em",
                  height: "0.52em",
                  background: "var(--vermilion)",
                  transform: "skewX(-12deg)",
                  marginTop: "0.06em",
                  flex: "none",
                }}
              />
            </h1>

            <p className="spec" style={{marginTop: 16}}>
              Performance study 01 / Relentless uptime
            </p>

            <p
              style={{
                marginTop: 22,
                fontSize: 16.5,
                lineHeight: 1.6,
                color: "var(--ink-70)",
                maxWidth: "44ch",
              }}
            >
              Sell the earnings your machine has not made yet. Two agents argue over what six
              months of a node&rsquo;s revenue is worth today. The chain says what it actually
              earned.
            </p>

            <div style={{display: "flex", gap: 11, marginTop: 30, flexWrap: "wrap"}}>
              <Link href="/node" className="pill pill-solid" style={{padding: "15px 28px"}}>
                Value a node <span aria-hidden>↗</span>
              </Link>
              <Link href="/#how" className="pill pill-ghost" style={{padding: "15px 28px"}}>
                Read the method
              </Link>
            </div>
          </div>

          <div>
            <div style={{display: "flex", justifyContent: "flex-end", marginBottom: 4}}>
              <ChipRail />
            </div>
            <Hardware />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 13}}>
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
              <path d="M2 20 L11 2 L20 20 Z" fill="none" stroke="var(--ink-30)" strokeWidth="1.4" />
              <path d="M7 20 L11 12 L15 20 Z" fill="var(--ink-30)" opacity="0.5" />
            </svg>
            <p className="spec" style={{lineHeight: 1.5}}>
              Built for machines
              <br />
              that don&rsquo;t pause
            </p>
          </div>

          <div style={{display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 160}}>
            <span className="rule" style={{flex: 1}} />
            <span className="spec">Uptime // 01</span>
            <span aria-hidden style={{display: "flex", gap: 3, transform: "skewX(-16deg)"}}>
              <i style={{width: 5, height: 17, background: "var(--ink)"}} />
              <i style={{width: 5, height: 17, background: "var(--ink-30)"}} />
              <i style={{width: 5, height: 17, background: "var(--vermilion)"}} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Three claims, each one something the deployment actually does rather than a number chosen
 * to look impressive. "99.9% stability" would be the easy version and it would be invented.
 */
function ChipRail() {
  return (
    <div className="chip-rail">
      <div className="chip">
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
          <path d="M13 2 L4 14 h6 l-1 8 9-12 h-6 z" fill="var(--vermilion)" />
        </svg>
        <div>
          <p className="chip-value">On chain</p>
          <p className="chip-label">Read, not reported</p>
        </div>
      </div>

      <div className="chip">
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden fill="none" stroke="var(--ink)" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="12" cy="12" r="8.4" />
          <path d="M12 3.6 v3.2 M12 17.2 v3.2 M3.6 12 h3.2 M17.2 12 h3.2" />
        </svg>
        <div>
          <p className="chip-value">3 agents</p>
          <p className="chip-label">Opposing incentives</p>
        </div>
      </div>

      <div className="chip">
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="13" width="4" height="8" fill="var(--ghost-far)" />
          <rect x="10" y="8" width="4" height="13" fill="var(--ghost-mid)" />
          <rect x="17" y="3" width="4" height="18" fill="var(--vermilion)" />
        </svg>
        <div>
          <p className="chip-value">keccak256</p>
          <p className="chip-label">Tamper evident</p>
        </div>
      </div>
    </div>
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
    <section id="how" className="wrap" style={{paddingTop: 104}}>
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
    <section id="evidence" className="wrap" style={{paddingTop: 104}}>
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
    <section id="chain" className="wrap" style={{paddingTop: 104}}>
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
        <Link href="/node" className="pill pill-solid" style={{padding: "15px 28px"}}>
          Value a node <span aria-hidden>↗</span>
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
