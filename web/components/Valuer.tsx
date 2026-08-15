"use client";

import {useState} from "react";
import type {NodeProfile} from "@uptime/agents/revenue";
import type {NodeReasoning} from "@uptime/agents/node-schemas";

interface Sample {
  id: string;
  expectation: string;
  profile: NodeProfile;
}

interface Result {
  id: string;
  reasoning: NodeReasoning;
  canonicalJson: string;
  verdictHash: string;
  pricePerShare: number;
  projectedTermRevenue: number;
  spread: number;
  inverted: boolean;
}

type Stage = "idle" | "running" | "done" | "refused" | "failed";

export function Valuer({nodes}: {nodes: Sample[]}) {
  const [selected, setSelected] = useState(nodes[0]?.id ?? "");
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [problem, setProblem] = useState("");

  const node = nodes.find((n) => n.id === selected);

  async function run() {
    if (!node) return;
    setStage("running");
    setResult(null);
    setProblem("");

    try {
      const response = await fetch("/api/value", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({sampleId: node.id}),
      });
      const data = await response.json();

      if (response.status === 422) {
        setProblem(data.detail);
        setStage("refused");
        return;
      }
      if (!response.ok) throw new Error(data.detail ?? "The panel could not be run.");

      setResult(data);
      setStage("done");
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
      setStage("failed");
    }
  }

  return (
    <div style={{marginTop: 44}}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(258px, 1fr))",
          gap: 1,
          background: "var(--line)",
          border: "1px solid var(--line)",
        }}
      >
        {nodes.map((n) => (
          <NodeCard
            key={n.id}
            sample={n}
            active={n.id === selected}
            onPick={() => {
              setSelected(n.id);
              setStage("idle");
              setResult(null);
              setProblem("");
            }}
          />
        ))}
      </div>

      <div style={{marginTop: 26, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap"}}>
        <button className="btn" onClick={run} disabled={stage === "running" || !node}>
          {stage === "running" ? "Panel sitting…" : "Run the panel"}
        </button>
        {stage === "running" && (
          <p className="spec">Operator and investor arguing, then the arbiter</p>
        )}
      </div>

      {stage === "refused" && (
        <Callout tone="warn" title="Refused">
          {problem}
          <span style={{display: "block", marginTop: 10, color: "var(--ink-50)", fontSize: 13}}>
            This is the quality gate working. A number drawn from a record this thin would look
            exactly as confident as one drawn from a year of history, which is precisely why it
            is not produced.
          </span>
        </Callout>
      )}

      {stage === "failed" && (
        <Callout tone="bad" title="Failed">
          {problem}
        </Callout>
      )}

      {result && <Verdict result={result} />}
    </div>
  );
}

function NodeCard({
  sample,
  active,
  onPick,
}: {
  sample: Sample;
  active: boolean;
  onPick: () => void;
}) {
  const p = sample.profile;
  return (
    <button
      onClick={onPick}
      style={{
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        padding: "22px 20px 24px",
        background: active ? "var(--paper-deep)" : "var(--paper)",
        borderLeft: `3px solid ${active ? "var(--vermilion)" : "transparent"}`,
        font: "inherit",
        color: "inherit",
      }}
    >
      <p className="spec" style={{color: active ? "var(--vermilion)" : undefined}}>
        {sample.id}
      </p>
      <p style={{marginTop: 12, fontSize: 14.5, color: "var(--ink-70)", lineHeight: 1.55}}>
        {sample.expectation}
      </p>
      <dl style={{margin: "16px 0 0", display: "grid", gap: 5}}>
        <Stat k="observed" v={`${p.observed_days} days · ${p.payment_count} payments`} />
        <Stat k="volatility" v={String(p.volatility)} />
        <Stat k="longest gap" v={`${p.longest_gap_days} days`} />
        <Stat k="trend" v={`${p.trend_percent > 0 ? "+" : ""}${p.trend_percent}%`} />
        <Stat k="quality" v={`${p.data_quality}/100`} />
        {p.net_monthly !== null && (
          <Stat k="net / month" v={`${p.net_monthly} ${p.currency}`} />
        )}
        {p.utilisation_percent !== null && (
          <Stat k="utilisation" v={`${p.utilisation_percent}%`} />
        )}
        <Stat k="source" v={p.verifiable ? "read from chain" : "attested by operator"} />
      </dl>
    </button>
  );
}

function Stat({k, v}: {k: string; v: string}) {
  return (
    <div style={{display: "flex", gap: 10, justifyContent: "space-between"}}>
      <dt className="mono" style={{fontSize: 11, color: "var(--ink-50)"}}>
        {k}
      </dt>
      <dd className="mono" style={{margin: 0, fontSize: 11.5, color: "var(--ink)"}}>
        {v}
      </dd>
    </div>
  );
}

function Verdict({result}: {result: Result}) {
  const {profile, operator, investor, arbiter} = result.reasoning;

  return (
    <div className="rise" style={{marginTop: 44}}>
      <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 26}}>
        <p className="spec">The argument</p>
        <div className="rule" style={{flex: 1}} />
        <div className="crosshair" />
      </div>

      {result.inverted && (
        <Callout tone="bad" title="Inverted debate">
          The operator&rsquo;s advocate came in below the investor, which means it argued
          against its own client. That is a broken debate rather than a wide one, and this
          valuation should not be trusted.
        </Callout>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 26,
        }}
      >
        <Case
          side="Operator"
          rate={operator.proposed_rate}
          tone="var(--ink)"
          points={operator.arguments}
          conceded={operator.strongest_counterargument}
        />
        <Case
          side="Investor"
          rate={investor.proposed_rate}
          tone="var(--ghost-far)"
          points={investor.risk_factors}
          conceded={investor.strongest_point_for_operator}
        />
      </div>

      <div className="plate" style={{marginTop: 30}}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <p className="spec">Verdict · {arbiter.which_agent_prevailed} prevailed</p>
          <p className="spec">spread {result.spread.toFixed(1)} points</p>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 24,
          }}
        >
          <Figure label="Node score" value={`${arbiter.node_score}`} accent />
          <Figure label="Price rate" value={`${arbiter.price_rate}%`} />
          <Figure
            label={`Per share (${profile.currency})`}
            value={result.pricePerShare.toFixed(4)}
          />
          <Figure
            label={`Next month (${profile.currency})`}
            value={`${arbiter.expected_monthly_low}–${arbiter.expected_monthly_high}`}
            projected
          />
          <Figure label="Confidence" value={String(arbiter.confidence)} />
        </div>

        <p style={{marginTop: 24, fontSize: 16, lineHeight: 1.6, maxWidth: "70ch"}}>
          {arbiter.rationale}
        </p>

        <div style={{marginTop: 26}}>
          <p className="spec" style={{marginBottom: 12}}>
            What would move the number
          </p>
          {arbiter.price_levers.map((lever, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                padding: "10px 0",
                borderTop: "1px solid var(--line-soft)",
              }}
            >
              <span className="mono" style={{color: "var(--vermilion)", fontSize: 13, flex: "none"}}>
                +{lever.worth}
              </span>
              <span style={{fontSize: 14.5, color: "var(--ink-70)"}}>{lever.change}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{marginTop: 26}}>
        <p className="spec" style={{marginBottom: 12}}>
          Commitments
        </p>
        <Hash label="verdictHash" value={result.verdictHash} />
        <p style={{marginTop: 14, fontSize: 13.5, color: "var(--ink-70)", lineHeight: 1.6}}>
          This is keccak256 over the canonical reasoning JSON — {result.canonicalJson.length}{" "}
          bytes, keys sorted at every level, no whitespace. Re-serialise the reasoning the same
          way, hash it, and you must get this back. That is what stops the rationale being
          rewritten after the fact.
        </p>
      </div>
    </div>
  );
}

function Case({
  side,
  rate,
  tone,
  points,
  conceded,
}: {
  side: string;
  rate: number;
  tone: string;
  points: string[];
  conceded: string;
}) {
  return (
    <div className="panel-flat">
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
        <p className="spec">{side}</p>
        <p className="figure" style={{color: tone}}>
          {rate}%
        </p>
      </div>
      <ul style={{margin: "18px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 12}}>
        {points.map((point, i) => (
          <li key={i} style={{display: "flex", gap: 10, fontSize: 14, lineHeight: 1.55}}>
            <span className="mono" style={{color: "var(--ink-30)", flex: "none", fontSize: 11}}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{color: "var(--ink-70)"}}>{point}</span>
          </li>
        ))}
      </ul>
      <p
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid var(--line)",
          fontSize: 13.5,
          color: "var(--ink-50)",
          lineHeight: 1.55,
        }}
      >
        <span className="spec">Conceded · </span>
        {conceded}
      </p>
    </div>
  );
}

function Figure({
  label,
  value,
  accent = false,
  projected = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  projected?: boolean;
}) {
  return (
    <div>
      <p
        className={`figure${projected ? " figure-projected" : ""}`}
        style={accent ? {color: "var(--vermilion)"} : undefined}
      >
        {value}
      </p>
      <p className="spec" style={{marginTop: 8}}>
        {label}
      </p>
    </div>
  );
}

function Hash({label, value}: {label: string; value: string}) {
  return (
    <div>
      <p className="mono" style={{fontSize: 12, color: "var(--vermilion)"}}>
        {label}
      </p>
      <p
        className="mono"
        style={{fontSize: 12.5, color: "var(--ink)", wordBreak: "break-all", marginTop: 4}}
      >
        {value}
      </p>
    </div>
  );
}

function Callout({
  tone,
  title,
  children,
}: {
  tone: "warn" | "bad";
  title: string;
  children: React.ReactNode;
}) {
  const colour = tone === "bad" ? "var(--vermilion)" : "var(--amber)";
  return (
    <div
      style={{
        marginTop: 26,
        padding: "18px 20px",
        border: `1px solid ${colour}`,
        borderLeft: `3px solid ${colour}`,
      }}
    >
      <p className="spec" style={{color: colour}}>
        {title}
      </p>
      <div style={{marginTop: 10, fontSize: 14.5, color: "var(--ink)", lineHeight: 1.6}}>
        {children}
      </div>
    </div>
  );
}
