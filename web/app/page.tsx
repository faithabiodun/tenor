import Link from "next/link";
import {Footer} from "../components/Chrome";

export default function Home() {
  return (
    <>
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
    <section className="landing-poster" aria-labelledby="landing-title">
      <Link href="/node" className="poster-nav poster-nav-left" aria-label="List a node">
        01 / node bay
      </Link>
      <Link href="/#how" className="poster-nav poster-nav-right" aria-label="Read the method">
        method / 03
      </Link>

      <div className="poster-brand">
        <h1 id="landing-title" className="display poster-wordmark">
          Uptime
          <span aria-hidden />
        </h1>
        <p className="spec">Performance study 01 / Relentless uptime</p>
      </div>

      <ProjectionStudy />

      <Link href="/node" className="poster-chip" aria-label="Open Uptime node bay">
        <span>UP</span>
        <span>01</span>
      </Link>
    </section>
  );
}

function ProjectionStudy() {
  return (
    <figure className="poster-study">
      <svg
        viewBox="0 0 1440 560"
        role="img"
        aria-label="A solid triple-fan Uptime compute module followed by three wireframe projection studies."
      >
        <defs>
          <linearGradient id="cardFace" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#38383a" />
            <stop offset="52%" stopColor="#151517" />
            <stop offset="100%" stopColor="#28282b" />
          </linearGradient>
          <radialGradient id="fanWell" cx="50%" cy="48%" r="58%">
            <stop offset="0%" stopColor="#2f3032" />
            <stop offset="45%" stopColor="#111113" />
            <stop offset="100%" stopColor="#050506" />
          </radialGradient>
          <filter id="softShadow" x="-10%" y="-20%" width="120%" height="160%">
            <feDropShadow dx="0" dy="9" stdDeviation="5" floodColor="#1c1c1e" floodOpacity="0.24" />
          </filter>
        </defs>

        <line x1="0" y1="478" x2="1428" y2="478" stroke="var(--line)" strokeWidth="1.2" />
        <line x1="46" y1="184" x2="1146" y2="184" stroke="var(--line-soft)" strokeWidth="0.9" />
        <line x1="46" y1="246" x2="1210" y2="246" stroke="var(--line-soft)" strokeWidth="0.7" />
        <line x1="46" y1="410" x2="1258" y2="410" stroke="var(--line-soft)" strokeWidth="0.7" />

        <WireModule x={1048} y={238} stroke="var(--ghost-far)" opacity={0.52} />
        <WireModule x={842} y={238} stroke="var(--ghost-mid)" opacity={0.54} />
        <WireModule x={636} y={238} stroke="var(--ghost-near)" opacity={0.58} />
        <SolidModule />

        <g>
          <text
            x="1298"
            y="164"
            textAnchor="end"
            className="mono"
            fontSize="12"
            letterSpacing="2.1"
            fill="var(--ink-70)"
          >
            FORM BEFORE POWER
          </text>
          <path
            d="M1286 173 L1286 195 L1162 195 L1119 237"
            fill="none"
            stroke="var(--ink-30)"
            strokeWidth="1"
          />
        </g>

        <g stroke="var(--ghost-far)" strokeWidth="1" opacity="0.55" fill="none">
          <line x1="1390" y1="255" x2="1422" y2="255" />
          <line x1="1406" y1="239" x2="1406" y2="271" />
          <circle cx="1406" cy="255" r="8" />
          <circle cx="1406" cy="255" r="2.5" />
        </g>
      </svg>
    </figure>
  );
}

function SolidModule() {
  const fans = [191, 391, 591];

  return (
    <g filter="url(#softShadow)">
      <path
        d="M92 226 L125 190 L750 190 L806 233 L806 406 L770 440 L122 440 L92 404 Z"
        fill="url(#cardFace)"
        stroke="#070708"
        strokeWidth="3"
      />
      <path
        d="M74 209 L92 226 L92 404 L74 424 L50 424 L50 209 Z"
        fill="#1a1a1c"
        stroke="#070708"
        strokeWidth="3"
      />
      <path
        d="M806 233 L831 252 L831 388 L806 406 Z"
        fill="#1a1a1c"
        stroke="#070708"
        strokeWidth="3"
      />
      <path d="M126 198 L734 198 L785 236" fill="none" stroke="var(--vermilion)" strokeWidth="4" />
      <path d="M137 430 L226 430 L226 450 L137 450 Z" fill="#19191b" stroke="#080809" strokeWidth="2" />
      <path d="M354 440 L354 458 L405 458 L405 440" fill="#202023" stroke="#080809" strokeWidth="2" />
      <path d="M112 439 L304 439" stroke="#b99047" strokeWidth="6" strokeDasharray="8 5" />

      <g opacity="0.42" stroke="#f2eee6" strokeWidth="1">
        <line x1="126" y1="223" x2="780" y2="223" />
        <line x1="124" y1="412" x2="772" y2="412" />
        <line x1="265" y1="200" x2="226" y2="438" />
        <line x1="525" y1="200" x2="486" y2="438" />
      </g>

      {fans.map((cx, i) => (
        <Fan key={cx} cx={cx} cy={315} label={i === 1 ? "03" : i === 0 ? "UPTIME" : "RELENTLESS"} />
      ))}

      <g className="mono">
        <text x="114" y="356" fontSize="28" fontWeight="800" letterSpacing="1.6" fill="#d8e4e8">
          UP
        </text>
        <text x="116" y="386" fontSize="27" fontWeight="800" letterSpacing="1.6" fill="#d8e4e8">
          01
        </text>
        <text x="116" y="407" fontSize="11" letterSpacing="1.7" fill="var(--vermilion)">
          UPTIME SERIES
        </text>
        <text x="522" y="210" fontSize="10" letterSpacing="2.3" fill="#c9c4bd">
          TYPE R / D3 / ON-CHAIN
        </text>
      </g>
    </g>
  );
}

function Fan({cx, cy, label}: {cx: number; cy: number; label: string}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="79" fill="#070708" stroke="#4e4f51" strokeWidth="4" />
      <circle cx={cx} cy={cy} r="65" fill="url(#fanWell)" stroke="#26272a" strokeWidth="2" />
      {Array.from({length: 11}, (_, i) => (
        <path
          key={i}
          d={`M${cx + 10} ${cy - 10} C ${cx + 43} ${cy - 55}, ${cx + 75} ${cy - 38}, ${cx + 43} ${cy - 5} C ${cx + 30} ${cy + 7}, ${cx + 18} ${cy + 8}, ${cx + 6} ${cy + 3} Z`}
          fill="#17181a"
          stroke="#3b3c3f"
          strokeWidth="1"
          transform={`rotate(${i * 32.72} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r="24" fill="#202123" stroke="#595a5c" strokeWidth="2" />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        className="mono"
        fontSize={label === "03" ? 20 : 9}
        fontWeight="800"
        letterSpacing={label === "03" ? 1.2 : 0.8}
        fill="#d7d1c8"
      >
        {label}
      </text>
    </g>
  );
}

function WireModule({
  x,
  y,
  stroke = "var(--ink)",
  opacity = 1,
}: {
  x: number;
  y: number;
  stroke?: string;
  opacity?: number;
}) {
  const w = 276;
  const h = 168;
  const body =
    `M${x},${y + 19} L${x + 25},${y} L${x + w - 39},${y} L${x + w},${y + 31} ` +
    `L${x + w},${y + h - 26} L${x + w - 31},${y + h} L${x + 26},${y + h} L${x},${y + h - 25} Z`;
  const fans = [0.24, 0.5, 0.76].map((t) => x + w * t);
  const cy = y + h / 2;

  return (
    <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="1.25">
      <path d={body} />
      <path d={`M${x + 29},${y + 10} L${x + w - 48},${y + 10} L${x + w - 14},${y + 38}`} />
      <path d={`M${x + 18},${y + h - 13} L${x + w - 44},${y + h - 13}`} />
      <path d={`M${x + 92},${y} L${x + 58},${y + h}`} opacity="0.6" />
      <path d={`M${x + 190},${y} L${x + 156},${y + h}`} opacity="0.6" />
      {fans.map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="47" />
          <circle cx={cx} cy={cy} r="15" />
          {Array.from({length: 9}, (_, b) => (
            <path
              key={b}
              d={`M${cx + 7} ${cy - 5} C ${cx + 29} ${cy - 37}, ${cx + 48} ${cy - 25}, ${cx + 28} ${cy - 3}`}
              transform={`rotate(${b * 40} ${cx} ${cy})`}
              opacity="0.72"
            />
          ))}
        </g>
      ))}
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
            Two sample nodes / same code, same day
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
              /api/valuation/0x7d8e1028...
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
