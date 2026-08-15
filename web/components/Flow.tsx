"use client";

import {useEffect, useRef, useState} from "react";

/**
 * The explainer: one real node, moving through the five stages that priced it.
 *
 * Everything shown here is the output of an actual run against the steady fixture on the
 * live deployment, not shapes standing in for numbers. The previous version drew isometric
 * blocks and hung captions off them, which is a diagram of an explanation rather than an
 * explanation: abstract geometry cannot say "124 days" or "62%", so the words ended up
 * doing all the work anyway.
 *
 * CSS transforms in perspective rather than WebGL. This is a handful of cards turning in
 * space, and a canvas renderer would be a heavy dependency for that.
 */

const STEPS = ["Machine", "Read", "Debate", "Verdict", "Shares"] as const;
const DWELL = [3200, 4000, 4600, 4400, 4000];

export function Flow() {
  const [step, setStep] = useState(0);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      setStep(STEPS.length - 1);
      return;
    }
    const node = root.current;
    // Some in-app wallet browsers ship without IntersectionObserver. Without this the
    // sequence would never start and it would sit on its first frame forever, which reads
    // as a broken page rather than a missing optimisation.
    if (!node || typeof IntersectionObserver === "undefined") {
      setLive(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setLive(Boolean(e?.isIntersecting)), {
      threshold: 0.3,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live || still) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), DWELL[step]);
    return () => window.clearTimeout(id);
  }, [live, still, step]);

  return (
    <div ref={root}>
      <div className="stage" role="group" aria-label="One node, from machine to shares">
        <Scene show={step === 0}>
          <Card turn={step === 0 ? -7 : -22} depth={step === 0 ? 0 : -220}>
            <Eyebrow>DePIN · listed by its operator</Eyebrow>
            <Big>NODE-01</Big>
            <Meta>Residential bandwidth node · 14 months old · 78% utilised</Meta>
            <Field k="paid to" v="0xdb64…a7e8" z={16} />
            <Field k="chain" v="X Layer · 196" z={30} />
          </Card>
        </Scene>

        <Scene show={step === 1}>
          <Card turn={-9} depth={-20}>
            <Eyebrow>Read from the chain, not from a form</Eyebrow>
            <Big>124 days</Big>
            <Meta>124 payments, none missed</Meta>
            <Field k="volatility" v="0.051" z={16} />
            <Field k="longest gap" v="1 day" z={30} />
            <Field k="trend" v="+12.6%" z={44} />
            <Field k="net / month" v="9.62 USDT" z={58} />
          </Card>
        </Scene>

        <Scene show={step === 2}>
          <Agent
            side="left"
            title="Operator's advocate"
            rate={92}
            point="124 payments in 124 days, volatility of 0.051 and a rising trend. This machine has already proven itself."
          />
          <Agent
            side="right"
            title="Investor"
            rate={50}
            point="Six months priced off four months of history, and nothing compels the operator to keep it running once paid."
          />
        </Scene>

        <Scene show={step === 3}>
          <Card turn={0} depth={10}>
            <Eyebrow>The arbiter decides</Eyebrow>
            <div className="verdict-row">
              <div>
                <Big>84</Big>
                <Meta>node score</Meta>
              </div>
              <div>
                <Big accent>62%</Big>
                <Meta>of projected earnings</Meta>
              </div>
            </div>
            <Track low={50} high={92} mark={62} />
            <Meta>Next month 12–16 USDT · confidence 73</Meta>
          </Card>
        </Scene>

        <Scene show={step === 4}>
          <Card turn={6} depth={0}>
            <Eyebrow>Six months, divided</Eyebrow>
            <Big>100 shares</Big>
            <Meta>You hold all of them until somebody buys</Meta>
            <div className="share-grid">
              {Array.from({length: 40}, (_, i) => (
                <span key={i} className={i >= 26 ? "sold" : undefined} />
              ))}
            </div>
            <Meta>Earnings arrive at the vault and every holder claims their part</Meta>
          </Card>
        </Scene>
      </div>

      <ol className="flow-rail">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => {
                setStep(i);
                setStill(true);
              }}
              className={`flow-step${i === step ? " is-active" : ""}`}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="flow-step-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="flow-step-label">{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <p className="stage-note">
        Every figure above is real output from the deployment you are reading this on.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------------------
 * Pieces
 * ------------------------------------------------------------------------------------ */

function Scene({show, children}: {show: boolean; children: React.ReactNode}) {
  return (
    <div className={`scene-layer${show ? " is-on" : ""}`} aria-hidden={!show}>
      {children}
    </div>
  );
}

function Card({
  turn,
  depth,
  children,
}: {
  turn: number;
  depth: number;
  children: React.ReactNode;
}) {
  return (
    <div className="card3d" style={{transform: `translateZ(${depth}px) rotateY(${turn}deg)`}}>
      {children}
    </div>
  );
}

function Eyebrow({children}: {children: React.ReactNode}) {
  return <span className="spec">{children}</span>;
}

function Big({children, accent = false}: {children: React.ReactNode; accent?: boolean}) {
  return <div className={`card3d-big${accent ? " is-accent" : ""}`}>{children}</div>;
}

function Meta({children}: {children: React.ReactNode}) {
  return <div className="card3d-meta">{children}</div>;
}

/** A row that lifts off the card face, so the card reads as having thickness. */
function Field({k, v, z}: {k: string; v: string; z: number}) {
  return (
    <div className="card3d-field" style={{transform: `translateZ(${z}px)`}}>
      <span>{k}</span>
      <span className="mono">{v}</span>
    </div>
  );
}

function Agent({
  side,
  title,
  rate,
  point,
}: {
  side: "left" | "right";
  title: string;
  rate: number;
  point: string;
}) {
  const left = side === "left";
  return (
    <div className="agent-wrap">
      <div
        className="agent"
        style={{
          transform: `translateX(${left ? -54 : 54}%) translateZ(34px) rotateY(${left ? 15 : -15}deg)`,
          borderLeftColor: left ? "var(--ink)" : "var(--ghost-far)",
        }}
      >
        <span className="spec">{title}</span>
        <div className="agent-rate" style={{color: left ? "var(--ink)" : "var(--ghost-far)"}}>
          {rate}%
        </div>
        <p>{point}</p>
      </div>
    </div>
  );
}

/** The two proposals as a span, and where the arbiter actually landed inside it. */
function Track({low, high, mark}: {low: number; high: number; mark: number}) {
  return (
    <div className="track">
      <span className="track-rail" />
      <span className="track-span" style={{left: `${low}%`, width: `${high - low}%`}} />
      <span className="track-mark" style={{left: `${mark}%`}} />
    </div>
  );
}
