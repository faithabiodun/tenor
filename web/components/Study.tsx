"use client";

import {useEffect, useRef, useState} from "react";

/**

 * The projection study, restored.

 *

 * One solid module, then three wireframes receding. Solid is revenue the chain has already

 * recorded; each ghost sits further into a projection and is drawn fainter because less is

 * known about it. The colours are load bearing and must not be reused for emphasis.

 *

 * This is the drawing the rest of the page now follows: line work on a ground line, with

 * captions on the baseline rather than labels floating inside the picture.

 */



/**

 * The hero drawing.

 *

 * One solid module, then three wireframes receding. The sequence is the product: the solid

 * form is revenue the chain has already recorded, and each ghost is further into a

 * projection, drawn fainter because less is known about it. Nothing here is styling for its

 * own sake, and the colours must keep meaning what they mean.

 */

export function ProjectionStudy() {

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
 * Two more figures in the same hand: line work on a ground line, captions on the baseline.
 * ------------------------------------------------------------------------------------ */

/** Two towers at the same height until one is handed the risk checklist. */
export function AgreementStudy() {
  return (
    <figure style={{margin: "34px 0 0"}}>
      <svg
        viewBox="0 0 1200 340"
        role="img"
        aria-label="Two identical towers; the right one drops away once only it is given the risk checklist."
        style={{width: "100%", height: "auto", display: "block"}}
      >
        <line x1="20" y1="252" x2="1160" y2="252" stroke="var(--line)" strokeWidth="1" />

        {/* Same evidence, same answer: identical solid forms. */}
        <Tower x={90} h={196} solid delay={0} />
        <Tower x={400} h={196} solid delay={160} />

        {/* Given the checklist, the investor's number falls away. */}
        <Tower x={710} h={196} stroke="var(--ghost-mid)" dashed delay={320} />
        <Tower x={710} h={76} stroke="var(--ghost-far)" delay={520} />

        {/* The checklist itself, which only ever reaches the right-hand agent. */}
        <g stroke="var(--ghost-far)" fill="none" strokeWidth="1.1">
          <rect x="980" y="70" width="120" height="140" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1="1002" y1={94 + i * 20} x2="1078" y2={94 + i * 20} />
          ))}
          <path className="draw" d="M966 140 L862 140" strokeDasharray="5 5" />
        </g>

        <StudyCaption x={90} label="OPERATOR" sub="92%" tone="var(--ink-70)" />
        <StudyCaption x={400} label="SAME BRIEF" sub="SAME ANSWER" tone="var(--ink-70)" />
        <StudyCaption x={710} label="INVESTOR" sub="50% WITH THE CHECKLIST" tone="var(--ghost-far)" />
      </svg>
    </figure>
  );
}

/** An asset whose truth must pass through a person, beside one whose truth is already on chain. */
export function OracleStudy() {
  return (
    <figure style={{margin: "34px 0 0"}}>
      <svg
        viewBox="0 0 1200 340"
        role="img"
        aria-label="A tokenised building must pass through someone who vouches for it; a machine's earnings reach the chain directly."
        style={{width: "100%", height: "auto", display: "block"}}
      >
        <line x1="20" y1="252" x2="1160" y2="252" stroke="var(--line)" strokeWidth="1" />

        {/* Left: a building, an attestor, then the chain. */}
        <Tower x={60} h={186} stroke="var(--ghost-mid)" delay={0} />
        <g stroke="var(--vermilion)" fill="none" strokeWidth="1.6">
          <circle cx="352" cy="182" r="34" />
          <path d="M328 158 L376 206" />
        </g>
        <path
          d="M196 182 L312 182 M392 182 L502 182"
          stroke="var(--ink-30)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <Chain x={520} />

        {/* Right: a machine whose payments are already an event on the chain. */}
        <Tower x={760} h={124} solid delay={240} />
        <path className="draw" d="M896 182 L1042 182" stroke="var(--vermilion)" strokeWidth="1.4" strokeDasharray="5 5" />
        <Chain x={1060} />

        <StudyCaption x={60} label="A BUILDING" sub="SOMEBODY MUST VOUCH" tone="var(--ghost-mid)" />
        <StudyCaption x={318} label="THE WEAK LINK" sub="TRUST REQUIRED" tone="var(--vermilion)" />
        <StudyCaption x={760} label="A MACHINE" sub="NOBODY TO TRUST" tone="var(--ink-70)" />
      </svg>
    </figure>
  );
}

/** A chamfered upright, solid when measured and wireframe when not. */
function Tower({
  x,
  h,
  solid = false,
  stroke = "var(--ink)",
  dashed = false,
  delay = 0,
}: {
  x: number;
  h: number;
  solid?: boolean;
  stroke?: string;
  dashed?: boolean;
  delay?: number;
}) {
  const w = 150;
  const y = 252 - h;
  const d =
    `M${x},${y + 20} L${x + 20},${y} L${x + w - 20},${y} L${x + w},${y + 20} ` +
    `L${x + w},${252} L${x},${252} Z`;
  return (
    <g className="grow" style={{animationDelay: `${delay}ms`}}>
      <path
        d={d}
        fill={solid ? "var(--carbon)" : "none"}
        stroke={solid ? "var(--ink)" : stroke}
        strokeWidth={solid ? 1.5 : 1.1}
        strokeDasharray={dashed ? "5 5" : undefined}
      />
      {solid && (
        <path d={`M${x + 16},${y + 10} L${x + w - 30},${y + 10}`} stroke="var(--vermilion)" strokeWidth="2.5" />
      )}
    </g>
  );
}

/** Three stacked bars: the chain, drawn the same way each time it appears. */
function Chain({x}: {x: number}) {
  return (
    <g fill="none" stroke="var(--ink)" strokeWidth="1.2">
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x} y={150 + i * 26} width={104} height={20} />
      ))}
    </g>
  );
}

function StudyCaption({x, label, sub, tone}: {x: number; label: string; sub: string; tone: string}) {
  return (
    <g>
      <line x1={x} y1="268" x2={x} y2="280" stroke="var(--line)" strokeWidth="1" />
      <text x={x} y="298" className="mono" fontSize="11" letterSpacing="2" fill={tone}>
        {label}
      </text>
      <text x={x} y="315" className="mono" fontSize="9.5" letterSpacing="1.6" fill="var(--ink-30)">
        {sub}
      </text>
    </g>
  );
}

/* --------------------------------------------------------------------------------------
 * The three studies as one sequence
 * ------------------------------------------------------------------------------------ */

const SEQUENCE = [
  {
    id: "read",
    Figure: ProjectionStudy,
    caption:
      "We read what the machine has actually been paid, straight from the chain. Everything past today is a projection, and it is drawn fainter the further out it goes.",
  },
  {
    id: "argue",
    Figure: AgreementStudy,
    caption:
      "Two AI agents price it. Give them the same information and they agree, so only one of them is handed the list of things that can go wrong.",
  },
  {
    id: "trust",
    Figure: OracleStudy,
    caption:
      "Tokenise a building and somebody has to vouch for it. A machine's earnings are already an event on the chain, so there is nobody to trust.",
  },
];

const DWELL = 6000;

/** The three drawings as one sequence, with the caption carried underneath in prose. */
export function StudySequence() {
  const [i, setI] = useState(0);
  const [live, setLive] = useState(false);
  const [held, setHeld] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    // Wallet in-app browsers sometimes ship without it. Run rather than sit on frame one.
    if (!el || typeof IntersectionObserver === "undefined") {
      setLive(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setLive(Boolean(e?.isIntersecting)), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live || held) return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const t = setTimeout(() => setI((n) => (n + 1) % SEQUENCE.length), DWELL);
    return () => clearTimeout(t);
  }, [i, live, held]);

  const step = SEQUENCE[i]!;
  const Figure = step.Figure;

  return (
    <div ref={root} className="sequence">
      {/* Keyed so each drawing remounts and replays its own build-in. */}
      <div key={step.id} className="sequence-figure">
        <Figure />
      </div>

      <p className="study-caption">{step.caption}</p>

      <div className="sequence-dots" role="tablist" aria-label="Choose a step">
        {SEQUENCE.map((s, n) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={n === i}
            aria-label={s.caption.slice(0, 40)}
            className={n === i ? "is-on" : undefined}
            onClick={() => {
              setI(n);
              setHeld(true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
