"use client";

import {useEffect, useRef, useState} from "react";

interface Props {
  bull: number;
  bear: number;
  verdict: number;
  confidence: number;
  client: string;
  amount: string;
  advanced: string;
}

const STEPS = ["Upload", "Extract", "Debate", "Verdict"] as const;
const DWELL = [2200, 2600, 3400, 4200];

/**
 * The explainer. Four staged scenes in real 3D space: the document tilts in, its fields lift
 * off it, the two agents rotate apart to opposite sides, and the verdict comes forward
 * between them.
 *
 * CSS transforms rather than WebGL. A canvas renderer would be a heavy dependency for what
 * is fundamentally four cards moving, and it would burn frames on a free instance. Depth
 * here comes from perspective, rotation and scale, not from shadows or glow.
 *
 * Numbers are the real ones from the snapshotted run, passed down from the fixture, so this
 * cannot drift into showing figures the product never produced.
 */
export function Pipeline({bull, bear, verdict, confidence, client, amount, advanced}: Props) {
  const [step, setStep] = useState(0);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setStep(STEPS.length - 1);
      return;
    }
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setLive(Boolean(entry?.isIntersecting)),
      {threshold: 0.35},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!live || still) return;
    const id = window.setTimeout(
      () => setStep((current) => (current + 1) % STEPS.length),
      DWELL[step],
    );
    return () => window.clearTimeout(id);
  }, [live, still, step]);

  return (
    <div ref={root}>
      <div
        role="group"
        aria-label="How Tenor prices a receivable"
        style={{
          position: "relative",
          height: "clamp(290px, 44vw, 380px)",
          // The stage exists only to establish the perspective origin. It has no surface of
          // its own: the cards fill it, so a frame around them would just be a box round a box.
          perspective: 1400,
          perspectiveOrigin: "50% 45%",
        }}
      >
        <Scene show={step === 0}>
          <Card
            depth={step === 0 ? 0 : -260}
            rotate={step === 0 ? -9 : -26}
            label="Invoice"
          >
            <Line width="72%" strong />
            <Line width="46%" />
            <div style={{height: 8}} />
            <Line width="88%" />
            <Line width="80%" />
            <Line width="62%" />
            <div style={{height: 8}} />
            <Line width="38%" strong />
          </Card>
        </Scene>

        <Scene show={step === 1}>
          <Card depth={-40} rotate={-11} label="Extracted">
            {[
              ["Client", client],
              ["Amount", amount],
              ["Terms", "net 45"],
              ["Payer id", "not stated"],
            ].map(([k, v], i) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  fontSize: "clamp(11px, 3vw, 13px)",
                  padding: "clamp(6px, 2vw, 9px) clamp(9px, 3vw, 12px)",
                  marginBottom: 7,
                  borderRadius: 5,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  transform: `translateZ(${(i + 1) * 14}px)`,
                }}
              >
                <span style={{color: "var(--ink-40)"}}>{k}</span>
                <span className="mono" style={{color: "var(--ink)"}}>
                  {v}
                </span>
              </div>
            ))}
          </Card>
        </Scene>

        <Scene show={step >= 2}>
          <Agent side="left" active={step >= 2} tone="green" title="The case for" rate={bull} />
          <Agent side="right" active={step >= 2} tone="ink" title="The case against" rate={bear} />
        </Scene>

        <Scene show={step === 3}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              transform: "translateZ(120px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                width: "min(380px, 88%)",
                padding: "clamp(16px, 4.5vw, 24px)",
                borderRadius: "var(--radius)",
                background: "var(--paper)",
                border: "1px solid var(--green-line)",
                textAlign: "center",
              }}
            >
              <span className="eyebrow">Verdict</span>
              <div
                className="mono"
                style={{
                  fontSize: "clamp(38px, 12vw, 56px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: "var(--green-deep)",
                }}
              >
                {verdict}%
              </div>
              <div className="mono" style={{fontSize: 13, color: "var(--ink-60)"}}>
                {advanced} advanced today
              </div>
              <Track bull={bull} bear={bear} verdict={verdict} />
              <div className="mono" style={{fontSize: 11, color: "var(--ink-40)"}}>
                confidence {confidence} / 100
              </div>
            </div>
          </div>
        </Scene>
      </div>

      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          listStyle: "none",
          margin: "16px 0 0",
          padding: 0,
        }}
      >
        {STEPS.map((label, index) => {
          const on = index === step;
          return (
            <li key={label}>
              <button
                onClick={() => setStep(index)}
                aria-current={on ? "step" : undefined}
                style={{
                  cursor: "pointer",
                  fontSize: 13,
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: `1px solid ${on ? "var(--green)" : "var(--line)"}`,
                  background: on ? "var(--green-wash)" : "transparent",
                  color: on ? "var(--green-deep)" : "var(--ink-60)",
                }}
              >
                {index + 1}. {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Scene({show, children}: {show: boolean; children: React.ReactNode}) {
  return (
    <div
      aria-hidden={!show}
      style={{
        position: "absolute",
        inset: 0,
        transformStyle: "preserve-3d",
        opacity: show ? 1 : 0,
        transition: "opacity 520ms ease",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

function Card({
  depth,
  rotate,
  label,
  children,
}: {
  depth: number;
  rotate: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          width: "min(520px, 94%)",
          padding: "clamp(16px, 4vw, 24px) clamp(18px, 5vw, 28px)",
          borderRadius: "var(--radius)",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          transform: `translateZ(${depth}px) rotateY(${rotate}deg) rotateX(4deg)`,
          transition: "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        <span className="eyebrow" style={{display: "block", marginBottom: 10}}>
          {label}
        </span>
        {children}
      </div>
    </div>
  );
}

function Line({width, strong = false}: {width: string; strong?: boolean}) {
  return (
    <div
      style={{
        width,
        height: strong ? 7 : 5,
        marginBottom: 6,
        borderRadius: 3,
        background: strong ? "var(--ink-40)" : "var(--line)",
      }}
    />
  );
}

function Agent({
  side,
  active,
  tone,
  title,
  rate,
}: {
  side: "left" | "right";
  active: boolean;
  tone: "green" | "ink";
  title: string;
  rate: number;
}) {
  const isLeft = side === "left";
  const accent = tone === "green" ? "var(--green)" : "var(--ink-40)";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          width: "min(300px, 47%)",
          padding: "clamp(13px, 3.4vw, 20px)",
          borderRadius: "var(--radius)",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderLeft: `4px solid ${accent}`,
          transform: active
            ? `translateX(${isLeft ? -52 : 52}%) translateZ(30px) rotateY(${isLeft ? 17 : -17}deg)`
            : "translateX(0) translateZ(-40px) rotateY(0deg)",
          transition: "transform 950ms cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        <span className="eyebrow" style={{fontSize: 10, letterSpacing: "0.1em"}}>
          {title}
        </span>
        <div
          className="mono"
          style={{
            fontSize: "clamp(26px, 7.4vw, 40px)",
            fontWeight: 700,
            lineHeight: 1.15,
            color: tone === "green" ? "var(--green-deep)" : "var(--ink)",
          }}
        >
          {rate}%
        </div>
        <Line width="90%" />
        <Line width="74%" />
        <Line width="82%" />
      </div>
    </div>
  );
}

function Track({bull, bear, verdict}: {bull: number; bear: number; verdict: number}) {
  const low = Math.min(bull, bear);
  const high = Math.max(bull, bear);
  return (
    <div style={{position: "relative", height: 22, margin: "12px 0 8px"}}>
      <div
        style={{
          position: "absolute",
          insetInline: 0,
          top: 10,
          height: 3,
          borderRadius: 2,
          background: "var(--line)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${low}%`,
          width: `${high - low}%`,
          top: 7,
          height: 9,
          borderRadius: 5,
          background: "var(--green-wash)",
          border: "1px solid var(--green-line)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${verdict}%`,
          top: 2,
          width: 3,
          height: 19,
          borderRadius: 2,
          background: "var(--green)",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}
