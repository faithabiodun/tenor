"use client";

import {useCallback, useEffect, useRef, useState} from "react";

/**
 * The explainer.
 *
 * Seven stages, drawn rather than described, because the previous version of this section
 * was three columns of prose that said the same thing more slowly. Each stage animates the
 * one idea it is responsible for and nothing else.
 *
 * The colour rules from the rest of the site hold here: vermilion is live and measured,
 * blue is projected, and ash is inert. Nothing is coloured for variety.
 */

interface Stage {
  id: string;
  label: string;
  caption: string;
}

const STAGES: Stage[] = [
  {id: "register", label: "Register", caption: "An operator lists a machine and the address it is paid to."},
  {id: "verify", label: "Verify", caption: "Uptime reads the payments straight from the chain. Nobody is asked to be believed."},
  {id: "underwrite", label: "Underwrite", caption: "Two agents argue. One wants the price high, one holds the shares if the machine dies."},
  {id: "score", label: "Score", caption: "The arbiter sets a score for the machine and a price for a share of it."},
  {id: "tokenise", label: "Tokenise", caption: "The term divides into shares. The operator starts holding all of them."},
  {id: "invest", label: "Invest", caption: "Buyers take shares at the priced rate. The operator is paid today."},
  {id: "settle", label: "Settle", caption: "Earnings arrive at the vault and every holder can claim their part."},
];

const DWELL = 3400;

export function Flow() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(true);
  const frame = useRef<number | null>(null);

  // Only animate once the section is actually on screen. A loop running behind the fold
  // costs battery on a phone for something nobody is looking at.
  const [seen, setSeen] = useState(false);
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setSeen(entry?.isIntersecting ?? false),
      {threshold: 0.25},
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running || !seen) return;
    const reduce =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % STAGES.length), DWELL);
    return () => clearTimeout(t);
  }, [active, running, seen]);

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current);
  }, []);

  const pick = useCallback((i: number) => {
    setActive(i);
    setRunning(false);
  }, []);

  const stage = STAGES[active]!;

  return (
    <div ref={host}>
      <div className="flow-stage" key={stage.id}>
        <Scene stage={stage.id} />
      </div>

      <p className="flow-caption">{stage.caption}</p>

      <ol className="flow-rail">
        {STAGES.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => pick(i)}
              className={`flow-step${i === active ? " is-active" : ""}${i < active ? " is-done" : ""}`}
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

/* --------------------------------------------------------------------------------------
 * Scenes
 * ------------------------------------------------------------------------------------ */

const VB = "0 0 760 260";

function Scene({stage}: {stage: string}) {
  return (
    <svg viewBox={VB} role="img" aria-label={STAGES.find((s) => s.id === stage)?.caption ?? ""}>
      <line x1="40" y1="212" x2="720" y2="212" stroke="var(--line)" strokeWidth="1" />
      {stage === "register" && <Register />}
      {stage === "verify" && <Verify />}
      {stage === "underwrite" && <Underwrite />}
      {stage === "score" && <Score />}
      {stage === "tokenise" && <Tokenise />}
      {stage === "invest" && <Invest />}
      {stage === "settle" && <Settle />}
    </svg>
  );
}

/** A compute module, small enough to be a character in the story rather than the subject. */
function Machine({x = 60, y = 96, w = 168, h = 96}: {x?: number; y?: number; w?: number; h?: number}) {
  const fans = [0.25, 0.5, 0.75].map((t) => x + w * t);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill="var(--carbon)" stroke="#0a0a0b" />
      <rect x={x + 10} y={y + 7} width={w - 34} height="3" rx="1.5" fill="var(--vermilion)" />
      {fans.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={y + h / 2 + 4} r="21" fill="#0d0d0f" stroke="#4a4b4f" />
          <circle cx={cx} cy={y + h / 2 + 4} r="7" fill="#232428" />
        </g>
      ))}
    </g>
  );
}

function Label({x, y, text, tone = "var(--ink-50)"}: {x: number; y: number; text: string; tone?: string}) {
  return (
    <text x={x} y={y} className="mono" fontSize="10.5" letterSpacing="1.8" fill={tone}>
      {text}
    </text>
  );
}

function Register() {
  return (
    <g className="fx-in">
      <Machine />
      <Label x={60} y={82} text="GPU-042 · AI COMPUTE" tone="var(--ink)" />
      <Label x={60} y={216} text="8× RTX 4090" />
      <g className="fx-in fx-d2">
        <path d="M244 144 L330 144" stroke="var(--ink-30)" strokeWidth="1" strokeDasharray="4 4" />
        <rect x="336" y="126" width="300" height="36" rx="4" fill="none" stroke="var(--line)" />
        <text x="350" y="149" className="mono" fontSize="12" fill="var(--ink-70)">
          0xdb64…a7e8
        </text>
        <Label x={336} y={116} text="PAYOUT ADDRESS" />
      </g>
    </g>
  );
}

function Verify() {
  const bars = [38, 52, 46, 61, 57, 68, 64, 72, 70, 79, 74, 83];
  return (
    <g>
      <Label x={60} y={82} text="READ FROM CHAIN · 124 DAYS" tone="var(--ink)" />
      {bars.map((v, i) => (
        <rect
          key={i}
          className="fx-grow"
          style={{animationDelay: `${i * 90}ms`}}
          x={60 + i * 54}
          y={212 - v}
          width="34"
          height={v}
          fill={i > 8 ? "var(--vermilion)" : "var(--carbon)"}
          opacity={i > 8 ? 1 : 0.82}
        />
      ))}
      <g className="fx-in fx-d3">
        <Label x={60} y={236} text="EVERY FIGURE DERIVED BY ARITHMETIC, NOT JUDGEMENT" />
      </g>
    </g>
  );
}

function Underwrite() {
  return (
    <g>
      {/* Operator pushes up, investor pushes down. The gap between them is the argument. */}
      <g className="fx-in">
        <Label x={60} y={70} text="OPERATOR · WANTS THE PRICE HIGH" tone="var(--ink)" />
        <rect className="fx-wide" x="60" y="80" height="26" fill="var(--carbon)" style={{width: 560}} />
        <text x="632" y="99" className="mono" fontSize="15" fill="var(--ink)">
          92%
        </text>
      </g>
      <g className="fx-in fx-d2">
        <Label x={60} y={150} text="INVESTOR · HOLDS THE SHARES IF IT DIES" tone="var(--ghost-far)" />
        <rect className="fx-wide" x="60" y="160" height="26" fill="var(--ghost-far)" style={{width: 300}} />
        <text x="372" y="179" className="mono" fontSize="15" fill="var(--ghost-far)">
          50%
        </text>
      </g>
      <g className="fx-in fx-d3">
        <Label x={60} y={236} text="ONLY THE INVESTOR SEES THE RISK CHECKLIST" />
      </g>
    </g>
  );
}

function Score() {
  return (
    <g className="fx-in">
      <circle cx="150" cy="140" r="66" fill="none" stroke="var(--line)" strokeWidth="10" />
      <circle
        className="fx-arc"
        cx="150"
        cy="140"
        r="66"
        fill="none"
        stroke="var(--vermilion)"
        strokeWidth="10"
        strokeLinecap="round"
        transform="rotate(-90 150 140)"
      />
      <text x="150" y="150" textAnchor="middle" className="mono" fontSize="40" fill="var(--ink)">
        84
      </text>
      <Label x={112} y={224} text="NODE SCORE" />

      <g className="fx-in fx-d2">
        <Label x={280} y={104} text="PRICE OF A SHARE" />
        <text x="280" y="146" className="mono" fontSize="38" fill="var(--vermilion)">
          62%
        </text>
        <text x="280" y="170" className="mono" fontSize="11" fill="var(--ink-50)">
          of projected term earnings
        </text>
      </g>
      <g className="fx-in fx-d3">
        <Label x={520} y={104} text="NEXT MONTH" />
        <text x="520" y="146" className="mono" fontSize="38" fill="var(--ghost-far)">
          12–16
        </text>
        <text x="520" y="170" className="mono" fontSize="11" fill="var(--ink-50)">
          a range, not a guess
        </text>
      </g>
    </g>
  );
}

const GRID = Array.from({length: 40}, (_, i) => i);

function Tokenise() {
  return (
    <g>
      <Label x={60} y={70} text="SIX MONTHS OF EARNINGS · 100 SHARES" tone="var(--ink)" />
      {GRID.map((i) => (
        <rect
          key={i}
          className="fx-pop"
          style={{animationDelay: `${i * 26}ms`}}
          x={60 + (i % 20) * 34}
          y={100 + Math.floor(i / 20) * 34}
          width="26"
          height="26"
          rx="2"
          fill="var(--carbon)"
        />
      ))}
      <g className="fx-in fx-d3">
        <Label x={60} y={216} text="ERC-1155 · ONE TOKEN ID PER MACHINE" />
      </g>
    </g>
  );
}

function Invest() {
  return (
    <g>
      <Label x={60} y={70} text="OPERATOR" tone="var(--ink)" />
      <Label x={560} y={70} text="BUYERS" tone="var(--ink)" />
      {GRID.map((i) => {
        const sold = i >= 24;
        return (
          <rect
            key={i}
            className={sold ? "fx-move" : ""}
            style={sold ? {animationDelay: `${(i - 24) * 60}ms`} : undefined}
            x={60 + (i % 20) * 34}
            y={100 + Math.floor(i / 20) * 34}
            width="26"
            height="26"
            rx="2"
            fill={sold ? "var(--vermilion)" : "var(--carbon)"}
            opacity={sold ? 1 : 0.45}
          />
        );
      })}
      <g className="fx-in fx-d3">
        <Label x={60} y={216} text="THE OPERATOR IS PAID TODAY FOR EARNINGS NOT YET MADE" />
      </g>
    </g>
  );
}

function Settle() {
  const drops = [0, 1, 2, 3, 4, 5];
  return (
    <g>
      <Label x={60} y={70} text="EARNINGS ARRIVE" tone="var(--ink)" />
      <rect x="300" y="120" width="160" height="72" rx="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="380" y="163" textAnchor="middle" className="mono" fontSize="12" fill="var(--ink)">
        VAULT
      </text>

      {drops.map((i) => (
        <circle
          key={i}
          className="fx-drop"
          style={{animationDelay: `${i * 260}ms`}}
          cx={110 + i * 34}
          cy="96"
          r="7"
          fill="var(--vermilion)"
        />
      ))}

      {drops.map((i) => (
        <circle
          key={`o${i}`}
          className="fx-fan"
          style={{animationDelay: `${900 + i * 160}ms`}}
          cx="470"
          cy="156"
          r="6"
          fill="var(--vermilion)"
        />
      ))}

      <g className="fx-in fx-d3">
        <Label x={60} y={236} text="CLAIMABLE PRO RATA · CORRECT EVEN WHEN SHARES CHANGE HANDS" />
      </g>
    </g>
  );
}
