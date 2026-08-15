"use client";

import {useCallback, useEffect, useRef, useState} from "react";

/**
 * The explainers.
 *
 * Drawn in isometric projection so the objects have volume rather than being diagrams of
 * objects. Text inside a scene is limited to figures the product actually produces; every
 * sentence lives underneath, where a caption belongs. A scene that has to label itself has
 * failed to draw itself.
 *
 * Colour keeps its meaning throughout: vermilion is measured and live, blue is projected,
 * ash is inert or unverified.
 */

/* Isometric projection. x runs right-and-down, y left-and-down, z straight up. */
const K = 0.866;
function iso(x: number, y: number, z = 0): [number, number] {
  return [(x - y) * K, (x + y) * 0.5 - z];
}
function pts(list: Array<[number, number]>): string {
  return list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
}

/** A solid box in isometric, shaded so its three faces read as one object under one light. */
function Box({
  x,
  y,
  w,
  d,
  h,
  top = "#3a3a40",
  left = "#232327",
  right = "#151518",
  stroke = "#0a0a0b",
  opacity = 1,
  className,
  style,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top?: string;
  left?: string;
  right?: string;
  stroke?: string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const A = iso(x, y, h);
  const B = iso(x + w, y, h);
  const C = iso(x + w, y + d, h);
  const D = iso(x, y + d, h);
  const b = iso(x, y + d, 0);
  const c = iso(x + w, y + d, 0);
  const e = iso(x + w, y, 0);
  return (
    <g className={className} style={style} opacity={opacity}>
      <polygon points={pts([A, B, C, D])} fill={top} stroke={stroke} strokeWidth="0.8" />
      <polygon points={pts([D, C, c, b])} fill={left} stroke={stroke} strokeWidth="0.8" />
      <polygon points={pts([C, B, e, c])} fill={right} stroke={stroke} strokeWidth="0.8" />
    </g>
  );
}

/* --------------------------------------------------------------------------------------
 * The seven-stage flow
 * ------------------------------------------------------------------------------------ */

const STAGES = [
  {id: "register", label: "Register", caption: "You own a machine that earns. Tell us where it gets paid."},
  {id: "verify", label: "Verify", caption: "We look up what it has actually been paid. No paperwork, no promises."},
  {id: "underwrite", label: "Underwrite", caption: "Two AI agents fight over what it is worth. One of them is paid to find the holes."},
  {id: "score", label: "Score", caption: "You get a score out of 100, and a price for one share of the next six months."},
  {id: "tokenise", label: "Tokenise", caption: "Those six months split into 100 shares. You start out holding every one."},
  {id: "invest", label: "Invest", caption: "People buy some. You get paid today for money the machine has not earned yet."},
  {id: "settle", label: "Settle", caption: "As it earns, the money arrives and everyone takes their share automatically."},
];

const DWELL = 3400;

export function Flow() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(true);
  const [seen, setSeen] = useState(false);
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") return setSeen(true);
    const io = new IntersectionObserver(([e]) => setSeen(e?.isIntersecting ?? false), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running || !seen) return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const t = setTimeout(() => setActive((i) => (i + 1) % STAGES.length), DWELL);
    return () => clearTimeout(t);
  }, [active, running, seen]);

  const pick = useCallback((i: number) => {
    setActive(i);
    setRunning(false);
  }, []);

  const stage = STAGES[active]!;

  return (
    <div ref={host}>
      <figure className="scene" key={stage.id}>
        <svg viewBox="-330 -40 660 300" role="img" aria-label={stage.caption}>
          {stage.id === "register" && <Register />}
          {stage.id === "verify" && <Verify />}
          {stage.id === "underwrite" && <Underwrite />}
          {stage.id === "score" && <Score />}
          {stage.id === "tokenise" && <Tokenise />}
          {stage.id === "invest" && <Invest />}
          {stage.id === "settle" && <Settle />}
        </svg>
      </figure>

      <p className="scene-caption">{stage.caption}</p>

      <ol className="flow-rail">
        {STAGES.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => pick(i)}
              className={`flow-step${i === active ? " is-active" : ""}`}
              aria-current={i === active ? "step" : undefined}
            >
              <span className="flow-step-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="flow-step-label">{s.label}</span>
              {i === active && running && seen && <span className="flow-step-bar" />}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The machine: a chassis with three sunken fan wells, in projection. */
function Machine({className, style}: {className?: string; style?: React.CSSProperties}) {
  return (
    <g className={className} style={style}>
      <Box x={-70} y={-70} w={140} d={140} h={26} />
      {[-42, 0, 42].map((o) => {
        const [cx, cy] = iso(o, o, 27);
        return (
          <g key={o}>
            <ellipse cx={cx} cy={cy} rx="26" ry="15" fill="#0c0c0e" stroke="#4c4d52" strokeWidth="1" />
            <ellipse cx={cx} cy={cy} rx="9" ry="5" fill="#26272b" />
          </g>
        );
      })}
      {/* The accent rail along the top edge, as on the card. */}
      <polygon
        points={pts([iso(-70, -70, 26), iso(70, -70, 26), iso(70, -60, 26), iso(-70, -60, 26)])}
        fill="var(--vermilion)"
      />
    </g>
  );
}

function Register() {
  return (
    <g>
      <Machine className="fx-drop-in" />
      {/* A beacon leaving the machine: it has announced itself and its address. */}
      {[0, 1, 2].map((i) => (
        <ellipse
          key={i}
          className="fx-ping"
          style={{animationDelay: `${500 + i * 700}ms`}}
          cx="0"
          cy={iso(0, 0, 0)[1] + 8}
          rx="90"
          ry="52"
          fill="none"
          stroke="var(--vermilion)"
          strokeWidth="1.4"
        />
      ))}
    </g>
  );
}

function Verify() {
  const heights = [22, 30, 26, 38, 34, 44, 40, 52, 48, 58, 54, 66];
  return (
    <g>
      {/* Payments landing on the chain, oldest at the back. */}
      {heights.map((h, i) => (
        <Box
          key={i}
          className="fx-rise"
          style={{animationDelay: `${i * 85}ms`}}
          x={-96 + i * 17}
          y={-96 + i * 17}
          w={12}
          d={12}
          h={h}
          top={i > 7 ? "#e86a52" : "#3a3a40"}
          left={i > 7 ? "var(--vermilion)" : "#232327"}
          right={i > 7 ? "#a52f1c" : "#151518"}
        />
      ))}
    </g>
  );
}

function Underwrite() {
  return (
    <g>
      {/* Two stacks pushed to opposite heights. The gap is the disagreement. */}
      <Box className="fx-rise" x={-96} y={-30} w={54} d={54} h={118} />
      <Box
        className="fx-rise"
        style={{animationDelay: "420ms"}}
        x={42}
        y={-30}
        w={54}
        d={54}
        h={54}
        top="#a9c6da"
        left="var(--ghost-far)"
        right="#5d86a3"
        stroke="#3f6379"
      />
      <text x={-108} y={iso(-96, -30, 118)[1] - 14} className="mono" fontSize="20" fill="var(--ink)">
        92
      </text>
      <text x={54} y={iso(42, -30, 54)[1] - 14} className="mono" fontSize="20" fill="var(--ghost-far)">
        50
      </text>
    </g>
  );
}

function Score() {
  return (
    <g className="fx-in">
      <circle cx="0" cy="110" r="74" fill="none" stroke="var(--line)" strokeWidth="12" />
      <circle
        className="fx-arc"
        cx="0"
        cy="110"
        r="74"
        fill="none"
        stroke="var(--vermilion)"
        strokeWidth="12"
        strokeLinecap="round"
        transform="rotate(-90 0 110)"
      />
      <text x="0" y="126" textAnchor="middle" className="mono" fontSize="54" fill="var(--ink)">
        84
      </text>
    </g>
  );
}

const TILES = Array.from({length: 36}, (_, i) => i);

function Tokenise() {
  return (
    <g>
      {TILES.map((i) => {
        const gx = (i % 6) * 26 - 78;
        const gy = Math.floor(i / 6) * 26 - 78;
        return (
          <Box
            key={i}
            className="fx-tile"
            style={{animationDelay: `${i * 34}ms`}}
            x={gx}
            y={gy}
            w={22}
            d={22}
            h={12}
          />
        );
      })}
    </g>
  );
}

function Invest() {
  return (
    <g>
      {TILES.map((i) => {
        const sold = i % 6 >= 4;
        const gx = (i % 6) * 26 - 78;
        const gy = Math.floor(i / 6) * 26 - 78;
        return (
          <Box
            key={i}
            className={sold ? "fx-lift" : ""}
            style={sold ? {animationDelay: `${i * 26}ms`} : undefined}
            x={gx}
            y={gy}
            w={22}
            d={22}
            h={sold ? 30 : 12}
            top={sold ? "#e86a52" : "#3a3a40"}
            left={sold ? "var(--vermilion)" : "#232327"}
            right={sold ? "#a52f1c" : "#151518"}
            opacity={sold ? 1 : 0.5}
          />
        );
      })}
    </g>
  );
}

function Settle() {
  const holders = [-78, -26, 26, 78];
  return (
    <g>
      {/* The vault, open, with revenue falling in and out again. */}
      <Box x={-52} y={-52} w={104} d={104} h={18} top="#2c2c31" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          className="fx-fall"
          style={{animationDelay: `${i * 300}ms`}}
          cx="0"
          cy="-30"
          r="8"
          fill="var(--vermilion)"
        />
      ))}
      {holders.map((h, i) => {
        const [hx, hy] = iso(h, h, 0);
        return (
          <g key={h}>
            <Box x={h - 11} y={h - 11} w={22} d={22} h={14} top="#4b4b52" />
            <circle
              className="fx-pay"
              style={{
                animationDelay: `${1500 + i * 180}ms`,
                // Each payout travels to its own holder, so the split is visibly pro rata.
                ["--tx" as string]: `${hx}px`,
                ["--ty" as string]: `${hy - 10}px`,
              }}
              cx="0"
              cy="18"
              r="7"
              fill="var(--vermilion)"
            />
          </g>
        );
      })}
    </g>
  );
}

/* --------------------------------------------------------------------------------------
 * Two models agree unless you stop them
 * ------------------------------------------------------------------------------------ */

export function AgreementFigure() {
  const [split, setSplit] = useState(false);
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) setSplit(false);
    });
    io.observe(el);
    const t = setInterval(() => setSplit((s) => !s), 2600);
    return () => {
      io.disconnect();
      clearInterval(t);
    };
  }, []);

  return (
    <div ref={host}>
      <figure className="scene scene-short">
        <svg
          viewBox="-260 -20 520 190"
          role="img"
          aria-label="Two towers at the same height, then one drops sharply once only it is given the risk checklist."
        >
          {/* Same brief, same answer. Then one is handed the checklist and falls away. */}
          <Box x={-96} y={-24} w={56} d={56} h={split ? 112 : 96} className="fx-morph" />
          <Box
            x={40}
            y={-24}
            w={56}
            d={56}
            h={split ? 40 : 96}
            className="fx-morph"
            top={split ? "#a9c6da" : "#3a3a40"}
            left={split ? "var(--ghost-far)" : "#232327"}
            right={split ? "#5d86a3" : "#151518"}
          />
          {/* The checklist, which only ever reaches the right-hand agent. */}
          <g className="fx-in" opacity={split ? 1 : 0}>
            <rect x="118" y="6" width="46" height="58" rx="3" fill="none" stroke="var(--ghost-far)" />
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="126"
                y1={18 + i * 12}
                x2="156"
                y2={18 + i * 12}
                stroke="var(--ghost-far)"
                strokeWidth="2"
              />
            ))}
          </g>
        </svg>
      </figure>
      <p className="scene-caption">
        {split
          ? "Only one of them gets the list of things that can go wrong. That is why they disagree."
          : "Give two AI models the same information and they say the same thing. That is not a debate."}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------------------
 * The chain is the oracle
 * ------------------------------------------------------------------------------------ */

export function OracleFigure() {
  return (
    <figure className="scene scene-short">
      <svg
        viewBox="-300 -30 600 210"
        role="img"
        aria-label="A tokenised building must pass through a person who vouches for it; a machine's earnings reach the chain directly."
      >
        {/* Left: an asset whose truth has to pass through somebody. */}
        <Box x={-150} y={-40} w={58} d={58} h={70} top="#4b4b52" left="#33333a" right="#212127" />
        <g className="fx-pulse">
          <circle cx="-92" cy="96" r="17" fill="none" stroke="var(--vermilion)" strokeWidth="2.5" />
          <line x1="-104" y1="84" x2="-80" y2="108" stroke="var(--vermilion)" strokeWidth="2.5" />
        </g>
        <path
          d="M-118 88 L-112 88 M-74 96 L-30 96"
          stroke="var(--ink-30)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <Box x={-14} y={30} w={40} d={40} h={10} top="#2c2c31" />

        {/* Right: a machine whose earnings are already an event on the chain. */}
        <Box x={104} y={-40} w={58} d={58} h={30} />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            className="fx-travel"
            style={{animationDelay: `${i * 480}ms`}}
            cx="112"
            cy="44"
            r="7"
            fill="var(--vermilion)"
          />
        ))}
        <Box x={148} y={72} w={40} d={40} h={10} top="#2c2c31" />
      </svg>
    </figure>
  );
}
