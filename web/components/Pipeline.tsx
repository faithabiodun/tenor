"use client";

import {useEffect, useRef, useState} from "react";
import {money, type Verdict} from "../lib/types";

const STEPS = ["Invoice", "Extract", "Debate", "Verdict"] as const;
const DWELL = [3000, 3400, 4200, 5200];

/**
 * The explainer: one real assessment, moving through the four stages that produced it.
 *
 * Everything shown is read from the snapshotted run rather than drawn. There are no
 * placeholder bars standing in for text and no invented figures — a mocked-up product
 * shot would be the one thing on this page a reader could not check, on a site whose
 * whole argument is that its numbers are checkable.
 *
 * CSS transforms rather than WebGL: this is four cards moving in perspective, and a canvas
 * renderer would be a heavy dependency for it.
 */
export function Pipeline({verdict}: {verdict: Verdict}) {
  const [step, setStep] = useState(0);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const {extraction, bull, bear, arbiter} = verdict.reasoning;

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
      {threshold: 0.3},
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
        aria-label="One assessment, from invoice to verdict"
        style={{
          position: "relative",
          height: "clamp(340px, 46vw, 420px)",
          perspective: 1500,
          perspectiveOrigin: "50% 42%",
        }}
      >
        <Scene show={step === 0}>
          <Card rotate={step === 0 ? -8 : -24} depth={step === 0 ? 0 : -240}>
            <Head>{extraction.client_name ?? "Unnamed payer"}</Head>
            <Big>
              {extraction.amount === null
                ? "amount unknown"
                : money(extraction.amount, extraction.currency)}
            </Big>
            <Meta>
              {extraction.payment_terms ?? "no terms stated"}
              {extraction.due_date ? ` · due ${extraction.due_date}` : ""}
            </Meta>
            <ul style={{margin: "14px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 6}}>
              {extraction.deliverables.slice(0, 3).map((item) => (
                <li key={item} style={{fontSize: 13, color: "var(--ink-60)", lineHeight: 1.45}}>
                  {truncate(item, 78)}
                </li>
              ))}
            </ul>
          </Card>
        </Scene>

        <Scene show={step === 1}>
          <Card rotate={-10} depth={-30}>
            <Head>Read out of the document</Head>
            <div style={{display: "grid", gap: 7, marginTop: 12}}>
              <Field k="payer" v={extraction.client_name ?? "not stated"} z={14} />
              <Field
                k="registration"
                v={extraction.payer_identifier ?? "not stated"}
                z={28}
                weak={!extraction.payer_identifier}
              />
              <Field
                k="history"
                v={extraction.payer_history ? truncate(extraction.payer_history, 46) : "none stated"}
                z={42}
                weak={!extraction.payer_history}
              />
              <Field
                k="late penalty"
                v={extraction.late_penalty ? truncate(extraction.late_penalty, 46) : "none"}
                z={56}
                weak={!extraction.late_penalty}
              />
            </div>
          </Card>
        </Scene>

        <Scene show={step >= 2}>
          <Agent
            side="left"
            active={step >= 2}
            title="The case for"
            rate={bull.proposed_rate}
            point={bull.arguments[0] ?? ""}
          />
          <Agent
            side="right"
            active={step >= 2}
            title="The case against"
            rate={bear.proposed_rate}
            point={bear.risk_factors[0] ?? ""}
          />
        </Scene>

        <Scene show={step === 3}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              transform: "translateZ(130px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                width: "min(420px, 90%)",
                padding: "clamp(18px, 4.5vw, 26px)",
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
                  fontSize: "clamp(40px, 12vw, 58px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: "var(--green-deep)",
                }}
              >
                {arbiter.advance_rate}%
              </div>
              <div className="mono" style={{fontSize: 13, color: "var(--ink-60)"}}>
                {money(verdict.advanceValue, extraction.currency)} advanced today
              </div>
              <Track bull={bull.proposed_rate} bear={bear.proposed_rate} verdict={arbiter.advance_rate} />
              <p style={{fontSize: 13, lineHeight: 1.5, color: "var(--ink-60)"}}>
                {truncate(arbiter.rationale, 150)}
              </p>
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
          margin: "18px 0 0",
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
                  padding: "7px 15px",
                  borderRadius: 999,
                  border: `1px solid ${on ? "var(--green)" : "var(--line)"}`,
                  background: on ? "var(--green-wash)" : "transparent",
                  color: on ? "var(--green-deep)" : "var(--ink-60)",
                }}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
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
  rotate,
  depth,
  children,
}: {
  rotate: number;
  depth: number;
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
          padding: "clamp(18px, 4.5vw, 26px) clamp(20px, 5vw, 30px)",
          borderRadius: "var(--radius)",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          transform: `translateZ(${depth}px) rotateY(${rotate}deg) rotateX(3deg)`,
          transition: "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
          textAlign: "left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Head({children}: {children: React.ReactNode}) {
  return (
    <div style={{fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em"}}>{children}</div>
  );
}

function Big({children}: {children: React.ReactNode}) {
  return (
    <div className="mono" style={{fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 700, marginTop: 4}}>
      {children}
    </div>
  );
}

function Meta({children}: {children: React.ReactNode}) {
  return (
    <div style={{fontSize: 13, color: "var(--ink-60)", marginTop: 6, lineHeight: 1.45}}>
      {children}
    </div>
  );
}

function Field({k, v, z, weak = false}: {k: string; v: string; z: number; weak?: boolean}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        fontSize: 13,
        padding: "8px 12px",
        borderRadius: 6,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        transform: `translateZ(${z}px)`,
      }}
    >
      <span style={{color: "var(--ink-40)", flex: "0 0 auto"}}>{k}</span>
      <span
        className="mono"
        style={{color: weak ? "var(--ink-40)" : "var(--ink)", textAlign: "right"}}
      >
        {v}
      </span>
    </div>
  );
}

function Agent({
  side,
  active,
  title,
  rate,
  point,
}: {
  side: "left" | "right";
  active: boolean;
  title: string;
  rate: number;
  point: string;
}) {
  const isLeft = side === "left";
  const accent = isLeft ? "var(--green)" : "var(--ink-40)";
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
          width: "min(310px, 47%)",
          padding: "clamp(14px, 3.4vw, 20px)",
          borderRadius: "var(--radius)",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderLeft: `4px solid ${accent}`,
          transform: active
            ? `translateX(${isLeft ? -52 : 52}%) translateZ(30px) rotateY(${isLeft ? 16 : -16}deg)`
            : "translateX(0) translateZ(-40px)",
          transition: "transform 950ms cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
          textAlign: "left",
        }}
      >
        <span className="eyebrow" style={{fontSize: 10}}>
          {title}
        </span>
        <div
          className="mono"
          style={{
            fontSize: "clamp(26px, 7vw, 38px)",
            fontWeight: 700,
            lineHeight: 1.15,
            color: isLeft ? "var(--green-deep)" : "var(--ink)",
          }}
        >
          {rate}%
        </div>
        <p style={{fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-60)", marginTop: 4}}>
          {truncate(point, 130)}
        </p>
      </div>
    </div>
  );
}

function Track({bull, bear, verdict}: {bull: number; bear: number; verdict: number}) {
  const low = Math.min(bull, bear);
  const high = Math.max(bull, bear);
  return (
    <div style={{position: "relative", height: 22, margin: "14px 0 10px"}}>
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
