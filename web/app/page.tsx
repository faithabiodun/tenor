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
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <p className="spec">Performance study 01 / Relentless uptime</p>
        <p className="spec spec-red">X Layer · chain 196</p>
      </div>

      <h1 className="display display-xl rise" style={{marginTop: 22, maxWidth: "14ch"}}>
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

      <ProjectionStudy />
    </section>
  );
}

/**
 * The hero drawing.
 *
 * One solid module, then three wireframes receding. The sequence is the product: the solid
 * form is revenue the chain has already recorded, and each ghost is further into a
 * projection, drawn fainter because less is known about it. Nothing here is styling for its
 * own sake, and the colours must keep meaning what they mean.
 */
function ProjectionStudy() {
  return (
    <figure style={{margin: "54px 0 0"}}>
      <svg
        viewBox="0 0 1200 430"
        role="img"
        aria-label="One solid module representing observed earnings, followed by three wireframe modules representing projected months, each fainter than the last."
        style={{width: "100%", height: "auto", display: "block", overflow: "visible"}}
      >
        {/* Ground line the modules sit on, as on a drawing sheet. */}
        <line x1="20" y1="330" x2="1140" y2="330" stroke="var(--line)" strokeWidth="1" />

        {/* Far ghost first, so nearer forms overlap it. */}
        <Module x={790} stroke="var(--ghost-far)" opacity={0.62} />
        <Module x={580} stroke="var(--ghost-mid)" opacity={0.72} />
        <Module x={372} stroke="var(--ghost-near)" opacity={0.78} />
        <Module x={44} solid />

        {/* Shadow under the solid module only. Only real things cast one. */}
        <ellipse cx="230" cy="335" rx="150" ry="4" fill="var(--ink)" opacity="0.14" />

        {/* Annotation, top right, with a leader running back toward the far ghost. */}
        <g>
          <text
            x="1140"
            y="106"
            textAnchor="end"
            className="mono"
            fontSize="11"
            letterSpacing="2.4"
            fill="var(--ink-70)"
          >
            OBSERVED BEFORE PROJECTED
          </text>
          <path
            d="M1136 118 L1136 150 L1010 150 L1010 196"
            fill="none"
            stroke="var(--ink-30)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </g>

        {/* Registration mark, far right margin. */}
        <g stroke="var(--ink-30)" strokeWidth="1" opacity="0.6" fill="none">
          <line x1="1168" y1="238" x2="1188" y2="238" />
          <line x1="1178" y1="228" x2="1178" y2="248" />
          <circle cx="1178" cy="238" r="6" />
        </g>

        <Caption x={44} label="OBSERVED" sub="READ FROM CHAIN" tone="var(--ink-70)" />
        <Caption x={372} label="MONTH 1–2" sub="PROJECTED" tone="var(--ghost-near)" />
        <Caption x={580} label="MONTH 3–4" sub="PROJECTED" tone="var(--ghost-mid)" />
        <Caption x={790} label="MONTH 5–6" sub="PROJECTED" tone="var(--ghost-far)" />
      </svg>
    </figure>
  );
}

/** A compute module: body, three fans, mounting tab. Solid when measured, wireframe when not. */
function Module({
  x,
  solid = false,
  stroke = "var(--ink)",
  opacity = 1,
}: {
  x: number;
  solid?: boolean;
  stroke?: string;
  opacity?: number;
}) {
  const y = 160;
  const w = 360;
  const h = 150;
  const body =
    `M${x},${y + 20} L${x + 16},${y} L${x + w - 34},${y} L${x + w},${y + 26} ` +
    `L${x + w},${y + h - 20} L${x + w - 18},${y + h} L${x + 18},${y + h} L${x},${y + h - 22} Z`;
  const fans = [0.24, 0.5, 0.76].map((t) => x + w * t);
  const cy = y + h / 2;

  return (
    <g opacity={opacity}>
      <path
        d={body}
        fill={solid ? "var(--carbon)" : "none"}
        stroke={solid ? "var(--ink)" : stroke}
        strokeWidth={solid ? 1.5 : 1.1}
      />

      {/* Accent stripe along the top edge, the one flash of colour on the real hardware. */}
      {solid && (
        <path
          d={`M${x + 24},${y + 9} L${x + w - 40},${y + 9}`}
          stroke="var(--vermilion)"
          strokeWidth="2.5"
        />
      )}

      {fans.map((cx, i) => (
        <g key={i}>
          <circle
            cx={cx}
            cy={cy}
            r="44"
            fill="none"
            stroke={solid ? "var(--ink-50)" : stroke}
            strokeWidth={solid ? 1.4 : 1}
          />
          <circle
            cx={cx}
            cy={cy}
            r="15"
            fill={solid ? "var(--ink)" : "none"}
            stroke={solid ? "var(--ink-50)" : stroke}
            strokeWidth="1"
          />
          {/* Blades are drawn only on the measured module. A projection has no detail to show. */}
          {solid &&
            Array.from({length: 9}, (_, b) => {
              const a = (b / 9) * Math.PI * 2;
              return (
                <line
                  key={b}
                  x1={cx + Math.cos(a) * 16}
                  y1={cy + Math.sin(a) * 16}
                  x2={cx + Math.cos(a + 0.5) * 43}
                  y2={cy + Math.sin(a + 0.5) * 43}
                  stroke="var(--ink-50)"
                  strokeWidth="1"
                  opacity="0.75"
                />
              );
            })}
        </g>
      ))}

      {/* Mounting tab and serial plate, on the measured module only. */}
      {solid && (
        <>
          <path
            d={`M${x - 14},${y + 6} L${x},${y + 20} L${x},${y + h - 22} L${x - 14},${y + h - 6} Z`}
            fill="var(--carbon)"
            stroke="var(--ink)"
            strokeWidth="1.2"
          />
          <text
            x={x + 26}
            y={y + h - 16}
            className="mono"
            fontSize="10"
            letterSpacing="1.8"
            fill="var(--ghost-mid)"
          >
            UP·01
          </text>
        </>
      )}
    </g>
  );
}

function Caption({x, label, sub, tone}: {x: number; label: string; sub: string; tone: string}) {
  return (
    <g>
      <line x1={x} y1="352" x2={x} y2="364" stroke="var(--line)" strokeWidth="1" />
      <text x={x} y="382" className="mono" fontSize="11" letterSpacing="2" fill={tone}>
        {label}
      </text>
      <text x={x} y="399" className="mono" fontSize="9.5" letterSpacing="1.6" fill="var(--ink-30)">
        {sub}
      </text>
    </g>
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
                <td>88%</td>
                <td>45%</td>
                <td style={{color: "var(--vermilion)", fontWeight: 600}}>78%</td>
              </tr>
              <tr>
                <td style={{color: "var(--ink)"}}>Decaying, hidden outage</td>
                <td>57.5%</td>
                <td>8%</td>
                <td style={{color: "var(--vermilion)", fontWeight: 600}}>30%</td>
              </tr>
            </tbody>
          </table>

          <p style={{marginTop: 20, fontSize: 14, color: "var(--ink-70)", lineHeight: 1.6}}>
            The investor led with the hole that nobody scripted for it:
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
            Nothing in the arrangement compels the operator to keep the node running once the
            shares are sold. The revenue depends on the continued goodwill of someone who has
            already been paid.
          </blockquote>
          <p style={{marginTop: 16, fontSize: 12.5, color: "var(--ink-50)"}}>
            Both nodes are fixtures with generated histories, labelled as such in the source.
            The rates are real model output.
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
