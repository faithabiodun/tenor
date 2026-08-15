import Link from "next/link";
import {Footer} from "../components/Chrome";

export default function Home() {
  return (
    <>
      <main>
        <Poster />
        <Method />
        <Asymmetry />
        <OnChain />
      </main>
      <Footer />
    </>
  );
}

/* --------------------------------------------------------------------------------------
 * The poster
 *
 * The entire composition lives inside one SVG on a fixed 1280x720 viewBox. Positioning the
 * wordmark, the study and the annotation as separate CSS-placed elements is what made this
 * scatter: each one reflows against a different edge, so the arrangement only held at the
 * width it was written at. Inside a single coordinate space the layout is locked, and the
 * whole thing scales as one drawing.
 *
 * The only words here are the ones on the reference sheet.
 * ------------------------------------------------------------------------------------ */

function Poster() {
  return (
    <section className="wrap" style={{paddingTop: 26}}>
      <svg
        viewBox="0 0 1280 720"
        role="img"
        aria-label="Uptime, performance study 01. A solid triple-fan compute module followed by three wireframe modules receding to the right."
        style={{width: "100%", height: "auto", display: "block"}}
      >
        <defs>
          <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3c3c40" />
            <stop offset="0.5" stopColor="#1e1e21" />
            <stop offset="1" stopColor="#141416" />
          </linearGradient>
          <radialGradient id="well" cx="50%" cy="46%" r="60%">
            <stop offset="0" stopColor="#2c2d30" />
            <stop offset="0.5" stopColor="#111113" />
            <stop offset="1" stopColor="#050506" />
          </radialGradient>
          <linearGradient id="pins" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c6a03a" />
            <stop offset="1" stopColor="#7d6118" />
          </linearGradient>
        </defs>

        {/* Wordmark, top right, exactly as the sheet sets it. */}
        <text
          x="1208"
          y="118"
          textAnchor="end"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 92,
            letterSpacing: "-0.045em",
          }}
          fill="var(--ink)"
        >
          UPTIME
        </text>
        <path d="M1218 46 L1240 46 L1228 118 L1206 118 Z" fill="var(--vermilion)" />

        <text
          x="1240"
          y="152"
          textAnchor="end"
          className="mono"
          fontSize="14.5"
          letterSpacing="3.1"
          fill="var(--ink-70)"
        >
          PERFORMANCE STUDY 01 / RELENTLESS UPTIME
        </text>

        {/* The measured module. */}
        <Module />

        {/* Projections. Vermilion is nearest to evidence, blue is furthest from it. */}
        <Ghost x={672} stroke="var(--ghost-near)" opacity={0.62} />
        <Ghost x={856} stroke="var(--ghost-mid)" opacity={0.5} />
        <Ghost x={1040} stroke="var(--ghost-far)" opacity={0.52} />

        {/* Ground shadow, under the real thing only. */}
        <ellipse cx="370" cy="556" rx="320" ry="7" fill="#1c1c1e" opacity="0.17" />
        <ellipse cx="370" cy="556" rx="180" ry="4" fill="#1c1c1e" opacity="0.18" />

        {/* Annotation. */}
        <text
          x="1218"
          y="300"
          textAnchor="end"
          className="mono"
          fontSize="12.5"
          letterSpacing="1.8"
          fontWeight="600"
          fill="var(--ink)"
        >
          FORM BEFORE POWER
        </text>
        <path
          d="M1214 312 L1214 330 L1150 330 L1122 358"
          fill="none"
          stroke="var(--ink-30)"
          strokeWidth="1"
        />

        {/* Registration mark. */}
        <g stroke="var(--ghost-far)" strokeWidth="1" fill="none" opacity="0.7">
          <line x1="1236" y1="392" x2="1268" y2="392" />
          <line x1="1252" y1="376" x2="1252" y2="408" />
          <circle cx="1252" cy="392" r="8" />
          <circle cx="1252" cy="392" r="2.5" />
        </g>

        {/* Sheet mark, bottom left. */}
        <g transform="translate(44,650)" opacity="0.5">
          <path d="M0 22 L11 0 L22 22 Z" fill="none" stroke="var(--ink-50)" strokeWidth="1.4" />
          <path d="M6 22 L11 12 L16 22 Z" fill="var(--ink-50)" />
        </g>
      </svg>

      {/* The single way into the product. Kept outside the drawing so the sheet stays a
          sheet, rather than a poster with buttons stuck on it. */}
      <div style={{display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap"}}>
        <Link href="/node" className="btn">
          Value a node
        </Link>
        <Link href="/#how" className="btn btn-ghost">
          The method
        </Link>
      </div>
    </section>
  );
}

const CX = 62;
const CY = 292;
const CW = 616;
const CH = 250;

const SILHOUETTE = (x: number, y: number, w: number, h: number) =>
  `M${x},${y + 26} L${x + 30},${y} L${x + w - 44},${y} L${x + w},${y + 32} ` +
  `L${x + w},${y + h - 28} L${x + w - 34},${y + h} L${x + 26},${y + h} L${x},${y + h - 30} Z`;

/** The measured module: bracket, shroud, three fans, accent rail, contact fingers. */
function Module() {
  const fans = [CX + 148, CX + 308, CX + 468];

  return (
    <g>
      {/* Bracket. */}
      <path
        d={`M${CX - 30},${CY - 8} L${CX - 6},${CY - 8} L${CX - 6},${CY + CH + 24} L${CX - 30},${CY + CH + 24} Z`}
        fill="#232326"
        stroke="#0a0a0b"
        strokeWidth="2"
      />
      {Array.from({length: 6}, (_, i) => (
        <rect key={i} x={CX - 25} y={CY + 12 + i * 34} width="14" height="18" rx="1.5" fill="#0e0e10" />
      ))}

      {/* PCB tail and gold fingers. */}
      <path
        d={`M${CX - 6},${CY + CH - 6} L${CX + 400},${CY + CH - 6} L${CX + 400},${CY + CH + 28} L${CX + 40},${CY + CH + 28} Z`}
        fill="#17251c"
        stroke="#0d150f"
        strokeWidth="1"
      />
      {Array.from({length: 22}, (_, i) => (
        <rect key={i} x={CX + 56 + i * 14} y={CY + CH + 10} width="9" height="18" fill="url(#pins)" />
      ))}

      {/* Shroud. */}
      <path d={SILHOUETTE(CX, CY, CW, CH)} fill="url(#face)" stroke="#08080a" strokeWidth="2.5" />

      {/* Top rail and the one flash of colour. */}
      <path d={`M${CX + 34},${CY + 11} L${CX + CW - 58},${CY + 11}`} stroke="#63636b" strokeWidth="3" />
      <path d={`M${CX + 42},${CY + 22} L${CX + CW - 150},${CY + 22}`} stroke="var(--vermilion)" strokeWidth="4" />
      <path
        d={`M${CX + CW - 128},${CY + 22} L${CX + CW - 74},${CY + 22}`}
        stroke="var(--vermilion)"
        strokeWidth="4"
        opacity="0.5"
      />

      {fans.map((cx, i) => (
        <Fan key={cx} cx={cx} cy={CY + 128} label={["UPTIME", "03", "RELENTLESS"][i]!} />
      ))}

      {/* Serial block. */}
      <text
        x={CX + 26}
        y={CY + 168}
        className="mono"
        fontSize="25"
        fontWeight="800"
        letterSpacing="1.4"
        fill="#dbe3e6"
      >
        UP
      </text>
      <text
        x={CX + 26}
        y={CY + 196}
        className="mono"
        fontSize="25"
        fontWeight="800"
        letterSpacing="1.4"
        fill="#dbe3e6"
      >
        01
      </text>
      <text x={CX + 26} y={CY + 214} className="mono" fontSize="9.5" letterSpacing="1.5" fill="var(--vermilion)">
        UPTIME SERIES
      </text>
    </g>
  );
}

function Fan({cx, cy, label}: {cx: number; cy: number; label: string}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="76" fill="#08080a" stroke="#4a4b4e" strokeWidth="3" />
      <circle cx={cx} cy={cy} r="63" fill="url(#well)" stroke="#232427" strokeWidth="1.5" />
      {Array.from({length: 11}, (_, i) => (
        <path
          key={i}
          d={
            `M${cx + 9},${cy - 9} C${cx + 41},${cy - 53} ${cx + 71},${cy - 36} ${cx + 41},${cy - 4} ` +
            `C${cx + 29},${cy + 7} ${cx + 17},${cy + 8} ${cx + 5},${cy + 3} Z`
          }
          fill="#16171a"
          stroke="#383a3d"
          strokeWidth="0.9"
          transform={`rotate(${i * 32.72} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r="23" fill="#1e1f22" stroke="#55565a" strokeWidth="1.8" />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        className="mono"
        fontSize={label === "03" ? 19 : 8.5}
        fontWeight="800"
        letterSpacing={label === "03" ? 1 : 0.7}
        fill="#d4cec5"
      >
        {label}
      </text>
    </g>
  );
}

/** A projection: one segment of the same object, wireframe, no detail, no shadow. */
function Ghost({x, stroke, opacity}: {x: number; stroke: string; opacity: number}) {
  const w = 236;
  const cx = x + w * 0.52;
  const cy = CY + 128;

  return (
    <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="1.2">
      <path d={SILHOUETTE(x, CY, w, CH)} />
      <circle cx={cx} cy={cy} r="76" />
      <circle cx={cx} cy={cy} r="63" />
      <circle cx={cx} cy={cy} r="23" />
      {Array.from({length: 11}, (_, i) => (
        <path
          key={i}
          d={`M${cx + 9},${cy - 9} C${cx + 41},${cy - 53} ${cx + 71},${cy - 36} ${cx + 41},${cy - 4}`}
          strokeWidth="0.9"
          transform={`rotate(${i * 32.72} ${cx} ${cy})`}
        />
      ))}
      <path d={`M${x + 34},${CY + 11} L${x + w - 58},${CY + 11}`} strokeWidth="1" />
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
      "the chain and derives every figure by arithmetic. Nobody is asked to be believed.",
  },
  {
    n: "02",
    title: "Two agents argue",
    body:
      "One argues for the highest price the record supports. The other holds the shares if " +
      "the node goes dark, and argues for the lowest. A third decides.",
  },
  {
    n: "03",
    title: "Shares, and the revenue that follows",
    body:
      "Buyers take shares at the priced rate. Earnings delivered to the vault become " +
      "claimable pro rata, and stay correct when shares change hands between payouts.",
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
 * The asymmetry
 * ------------------------------------------------------------------------------------ */

function Asymmetry() {
  return (
    <section id="evidence" className="wrap" style={{paddingTop: 96}}>
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
            Give two language models the same task and the same information and they reach the
            same answer nearly every time. You get something debate-shaped with no disagreement
            inside it.
          </p>
          <p className="lead" style={{marginTop: 14, fontSize: 16}}>
            So they are not given the same information. The investor works from a risk
            checklist. The operator&rsquo;s advocate never sees it, and is never told it exists.
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

          <blockquote
            style={{
              margin: "20px 0 0",
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
            The rates are real output from this deployment.
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
    body: "The exact earnings history the agents read, so a later claim can be checked against what was actually seen.",
  },
  {
    label: "verdictHash",
    body: "The reasoning that produced the price. It cannot be quietly rewritten once shares have sold.",
  },
  {
    label: "recordValuation",
    body: "Restricted to the valuation service. An operator pricing their own node is the failure this design prevents.",
  },
];

function OnChain() {
  return (
    <section id="chain" className="wrap" style={{paddingTop: 96}}>
      <SectionRule label="On chain" />
      <h2 className="display display-lg" style={{maxWidth: "20ch"}}>
        The chain is the oracle
      </h2>

      <p className="lead" style={{marginTop: 20}}>
        Tokenise a building or an invoice and you need someone trustworthy to swear the real
        thing did what it claimed. That person is the weak link. A node&rsquo;s earnings are
        already an on-chain event.
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
          Value a node
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
