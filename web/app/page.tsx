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
 * projection, drawn fainter because less is known about it. The colours must keep meaning
 * what they mean, and only the measured module gets depth, detail and a shadow.
 *
 * Ghosts are single-fan segments rather than full modules. Three full modules at this pitch
 * overlapped so heavily that their fans interleaved and the whole thing read as a tangle of
 * circles instead of one object receding.
 */
function ProjectionStudy() {
  return (
    <figure style={{margin: "54px 0 0"}}>
      <svg
        viewBox="0 0 1200 470"
        role="img"
        aria-label="One solid compute module representing observed earnings, followed by three wireframe segments representing projected months, each fainter than the last."
        style={{width: "100%", height: "auto", display: "block", overflow: "visible"}}
      >
        <defs>
          <linearGradient id="shroud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#43434a" />
            <stop offset="0.18" stopColor="#2b2b30" />
            <stop offset="0.62" stopColor="#1b1b1f" />
            <stop offset="1" stopColor="#101012" />
          </linearGradient>
          {/* Light falling across the face from the upper left, so the panel reads as a
              surface rather than a silhouette. */}
          <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="well" cx="42%" cy="36%" r="72%">
            <stop offset="0" stopColor="#34353a" />
            <stop offset="0.45" stopColor="#161719" />
            <stop offset="1" stopColor="#050506" />
          </radialGradient>
          <linearGradient id="pins" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cba63f" />
            <stop offset="1" stopColor="#7a5f16" />
          </linearGradient>
          <filter id="cast" x="-15%" y="-25%" width="130%" height="170%">
            <feDropShadow dx="0" dy="10" stdDeviation="7" floodColor="#1c1c1e" floodOpacity="0.30" />
          </filter>
        </defs>

        <line x1="20" y1="378" x2="1150" y2="378" stroke="var(--line)" strokeWidth="1" />

        {/* Far ghost first, so nearer forms overlap it. */}
        <Ghost x={864} stroke="var(--ghost-far)" opacity={0.6} />
        <Ghost x={700} stroke="var(--ghost-mid)" opacity={0.62} />
        <Ghost x={536} stroke="var(--ghost-near)" opacity={0.7} />
        <Module />

        {/* Contact shadow. Only real things cast one. */}
        <ellipse cx="290" cy="380" rx="245" ry="7" fill="#1c1c1e" opacity="0.17" />
        <ellipse cx="290" cy="380" rx="140" ry="4" fill="#1c1c1e" opacity="0.16" />

        <g>
          <text
            x="1140"
            y="74"
            textAnchor="end"
            className="mono"
            fontSize="11"
            letterSpacing="2.4"
            fill="var(--ink-70)"
          >
            OBSERVED BEFORE PROJECTED
          </text>
          <path
            d="M1136 86 L1136 118 L1000 118 L1000 152"
            fill="none"
            stroke="var(--ink-30)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </g>

        <g stroke="var(--ink-30)" strokeWidth="1" opacity="0.6" fill="none">
          <line x1="1140" y1="240" x2="1164" y2="240" />
          <line x1="1152" y1="228" x2="1152" y2="252" />
          <circle cx="1152" cy="240" r="7" />
        </g>

        <Caption x={40} label="OBSERVED" sub="READ FROM CHAIN" tone="var(--ink-70)" />
        <Caption x={536} label="MONTH 1–2" sub="PROJECTED" tone="var(--ghost-near)" />
        <Caption x={700} label="MONTH 3–4" sub="PROJECTED" tone="var(--ghost-mid)" />
        <Caption x={864} label="MONTH 5–6" sub="PROJECTED" tone="var(--ghost-far)" />
      </svg>
    </figure>
  );
}

const MX = 40;
const MY = 140;
const MW = 470;
const MH = 200;
const FAN_CY = MY + MH / 2;
const FAN_R = 58;

/** The chamfered card silhouette, shared by the measured module and its projections. */
function silhouette(x: number, y: number, w: number, h: number): string {
  return (
    `M${x},${y + 22} L${x + 26},${y} L${x + w - 38},${y} L${x + w},${y + 28} ` +
    `L${x + w},${y + h - 24} L${x + w - 30},${y + h} L${x + 22},${y + h} L${x},${y + h - 26} Z`
  );
}

/**
 * One fan blade, swept between two radii.
 *
 * Built from arcs rather than beziers so the outer edge sits exactly on the fan circle. A
 * bezier approximation drifts off the rim and the blades stop looking like they belong to
 * the same housing.
 */
function blade(cx: number, cy: number, a: number, r: number): string {
  const ri = r * 0.33;
  const ro = r * 0.96;
  const p = (angle: number, radius: number) =>
    `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  return (
    `M${p(a, ri)} L${p(a - 0.3, ro)} A${ro},${ro} 0 0 1 ${p(a + 0.28, ro)} ` +
    `L${p(a + 0.55, ri)} A${ri},${ri} 0 0 0 ${p(a, ri)} Z`
  );
}

const BLADES = 11;

/** The measured module: bracket, shroud, three fans, accent rail, contact fingers. */
function Module() {
  const fans = [MX + 118, MX + 235, MX + 352];

  return (
    <g filter="url(#cast)">
      {/* PCI bracket with vent slots. */}
      <path
        d={`M${MX - 26},${MY - 6} L${MX - 6},${MY - 6} L${MX - 6},${MY + MH + 18} L${MX - 26},${MY + MH + 18} Z`}
        fill="#26262a"
        stroke="#0a0a0b"
        strokeWidth="1.6"
      />
      {Array.from({length: 5}, (_, i) => (
        <rect key={i} x={MX - 22} y={MY + 10 + i * 34} width="12" height="18" rx="1.5" fill="#0d0d0f" />
      ))}

      {/* PCB tail and gold contact fingers. */}
      <path
        d={`M${MX - 6},${MY + MH - 4} L${MX + 300},${MY + MH - 4} L${MX + 300},${MY + MH + 24} L${MX + 34},${MY + MH + 24} Z`}
        fill="#18271d"
        stroke="#0d160f"
        strokeWidth="1"
      />
      {Array.from({length: 18}, (_, i) => (
        <rect key={i} x={MX + 48 + i * 13} y={MY + MH + 8} width="8" height="16" fill="url(#pins)" />
      ))}

      {/* Shroud, then the light across it. */}
      <path d={silhouette(MX, MY, MW, MH)} fill="url(#shroud)" stroke="#08080a" strokeWidth="2" />
      <path d={silhouette(MX, MY, MW, MH)} fill="url(#sheen)" />

      {/* Top rail highlight, then the one flash of colour on the real hardware. */}
      <path d={`M${MX + 30},${MY + 9} L${MX + MW - 46},${MY + 9}`} stroke="#6d6d76" strokeWidth="2.4" />
      <path
        d={`M${MX + 36},${MY + 18} L${MX + MW - 116},${MY + 18}`}
        stroke="var(--vermilion)"
        strokeWidth="3.2"
      />
      <path
        d={`M${MX + MW - 100},${MY + 18} L${MX + MW - 58},${MY + 18}`}
        stroke="var(--vermilion)"
        strokeWidth="3.2"
        opacity="0.5"
      />

      {fans.map((cx, i) => (
        <g key={cx}>
          {/* Housing rim and recessed well. */}
          <circle cx={cx} cy={FAN_CY} r={FAN_R + 6} fill="#0b0b0d" stroke="#4c4d51" strokeWidth="2" />
          <circle cx={cx} cy={FAN_CY} r={FAN_R} fill="url(#well)" stroke="#212226" strokeWidth="1.2" />

          {Array.from({length: BLADES}, (_, b) => (
            <path
              key={b}
              d={blade(cx, FAN_CY, (b / BLADES) * Math.PI * 2, FAN_R)}
              fill="#1a1b1e"
              stroke="#3b3d41"
              strokeWidth="0.7"
            />
          ))}

          {/* Hub. */}
          <circle cx={cx} cy={FAN_CY} r={FAN_R * 0.33} fill="#202126" stroke="#5a5b60" strokeWidth="1.4" />
          <circle cx={cx} cy={FAN_CY} r={FAN_R * 0.33} fill="url(#sheen)" />
          <text
            x={cx}
            y={FAN_CY + 3}
            textAnchor="middle"
            className="mono"
            fontSize={i === 1 ? 11 : 6.5}
            fontWeight="800"
            letterSpacing={i === 1 ? 0.6 : 0.5}
            fill="#cfcac2"
          >
            {["UPTIME", "01", "RELENTLESS"][i]}
          </text>
        </g>
      ))}

      {/* Serial plate. */}
      <text x={MX + 20} y={MY + MH - 30} className="mono" fontSize="15" fontWeight="800" fill="#d6dee2">
        UP·01
      </text>
      <text x={MX + 20} y={MY + MH - 16} className="mono" fontSize="7.5" letterSpacing="1.4" fill="var(--vermilion)">
        UPTIME SERIES
      </text>
    </g>
  );
}

/** A projection: one segment of the same object, wireframe, no fill, no shadow. */
function Ghost({x, stroke, opacity}: {x: number; stroke: string; opacity: number}) {
  const w = 200;
  const cx = x + w / 2;

  return (
    <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="1.15">
      <path d={silhouette(x, MY, w, MH)} />
      <circle cx={cx} cy={FAN_CY} r={FAN_R + 6} />
      <circle cx={cx} cy={FAN_CY} r={FAN_R} />
      {/* Blade outlines only. A projection can show the shape of the thing but none of its
          substance, which is the whole point of the drawing. */}
      {Array.from({length: BLADES}, (_, b) => (
        <path
          key={b}
          d={blade(cx, FAN_CY, (b / BLADES) * Math.PI * 2, FAN_R)}
          strokeWidth="0.75"
        />
      ))}
      <circle cx={cx} cy={FAN_CY} r={FAN_R * 0.33} />
      <path d={`M${x + 28},${MY + 9} L${x + w - 40},${MY + 9}`} strokeWidth="1" />
    </g>
  );
}

function Caption({x, label, sub, tone}: {x: number; label: string; sub: string; tone: string}) {
  return (
    <g>
      <line x1={x} y1="396" x2={x} y2="408" stroke="var(--line)" strokeWidth="1" />
      <text x={x} y="426" className="mono" fontSize="11" letterSpacing="2" fill={tone}>
        {label}
      </text>
      <text x={x} y="443" className="mono" fontSize="9.5" letterSpacing="1.6" fill="var(--ink-30)">
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
