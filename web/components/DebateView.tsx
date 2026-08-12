import {SpreadBar} from "./SpreadBar";
import {daysUntil, money, type Verdict} from "../lib/types";

/**
 * The hero screen. Two columns that are visibly opposed, then the verdict between them.
 *
 * Green is the freelancer's case and graphite-with-a-hatch is the capital provider's. The
 * palette is white and green, so rather than invent a second brand colour for the bear, the
 * split is carried by colour against texture.
 */
export function DebateView({verdict}: {verdict: Verdict}) {
  const {extraction, bull, bear, arbiter} = verdict.reasoning;
  const days = daysUntil(extraction.due_date);

  return (
    <article
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--paper)",
      }}
    >
      <header
        className="stage"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 22px",
          padding: "14px 20px",
          borderBottom: "1px solid var(--line)",
          alignItems: "baseline",
        }}
      >
        <strong style={{fontSize: 15, letterSpacing: "-0.01em"}}>
          {extraction.client_name ?? "Unnamed payer"}
        </strong>
        <span className="mono" style={{fontSize: 14}}>
          {extraction.amount === null
            ? "amount unknown"
            : money(extraction.amount, extraction.currency)}
        </span>
        {days !== null && (
          <span className="mono" style={{fontSize: 14, color: "var(--ink-60)"}}>
            {days} days to due
          </span>
        )}
        {extraction.missing_critical_fields.length > 0 && (
          <span
            className="mono"
            style={{
              fontSize: 12,
              marginLeft: "auto",
              border: "1px solid var(--green-line)",
              background: "var(--green-wash)",
              color: "var(--green-deep)",
              borderRadius: 999,
              padding: "2px 10px",
            }}
          >
            {extraction.missing_critical_fields.length} field
            {extraction.missing_critical_fields.length === 1 ? "" : "s"} missing
          </span>
        )}
      </header>

      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"}}>
        <Side
          kind="bull"
          title="The case for"
          rate={bull.proposed_rate}
          points={bull.arguments}
          conceded={bull.strongest_counterargument}
        />
        <Side
          kind="bear"
          title="The case against"
          rate={bear.proposed_rate}
          points={bear.risk_factors}
          conceded={bear.strongest_point_for_freelancer}
        />
      </div>

      <section
        className="stage"
        style={{
          borderTop: "1px solid var(--line)",
          padding: "28px 20px 24px",
          animationDelay: "840ms",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "0 18px",
            marginBottom: 18,
          }}
        >
          <span className="eyebrow">Verdict</span>
          <span
            className="mono"
            style={{fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 700, lineHeight: 1}}
          >
            {arbiter.advance_rate}%
          </span>
          {extraction.amount !== null && (
            <span className="mono" style={{fontSize: 20}}>
              {money(verdict.advanceValue, extraction.currency)} advanced today
            </span>
          )}
        </div>

        <SpreadBar
          bull={bull.proposed_rate}
          bear={bear.proposed_rate}
          verdict={arbiter.advance_rate}
        />

        <dl
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0 32px",
            margin: "22px 0 14px",
            fontSize: 14,
          }}
        >
          <Fact label="Confidence" value={`${arbiter.confidence} / 100`} />
          <Fact
            label="Prevailed"
            value={
              arbiter.which_agent_prevailed === "split"
                ? "Split decision"
                : arbiter.which_agent_prevailed === "bull"
                  ? "The case for"
                  : "The case against"
            }
          />
        </dl>

        <p style={{maxWidth: "62ch", fontSize: 18}}>{arbiter.rationale}</p>

        <p
          className="mono"
          style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
            fontSize: 12,
            color: "var(--ink-60)",
            wordBreak: "break-all",
          }}
        >
          verdict hash {verdict.verdictHash}
        </p>
      </section>
    </article>
  );
}

function Fact({label, value}: {label: string; value: string}) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mono" style={{margin: 0, fontSize: 15}}>
        {value}
      </dd>
    </div>
  );
}

function Side({
  kind,
  title,
  rate,
  points,
  conceded,
}: {
  kind: "bull" | "bear";
  title: string;
  rate: number;
  points: string[];
  conceded: string;
}) {
  const isBull = kind === "bull";
  return (
    <section
      className={isBull ? "stage-left" : "stage-right"}
      style={{
        padding: "22px 20px 24px",
        borderLeft: isBull ? "4px solid var(--green)" : undefined,
        animationDelay: "420ms",
        position: "relative",
      }}
    >
      {!isBull && (
        <span
          aria-hidden="true"
          className="hatch"
          style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 4}}
        />
      )}
      <div style={{display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14}}>
        <h3 className="eyebrow" style={{fontSize: 11}}>
          {title}
        </h3>
        <span className="mono" style={{fontSize: 34, fontWeight: 700, lineHeight: 1}}>
          {rate}%
        </span>
      </div>

      <ul style={{margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10}}>
        {points.map((point) => (
          <li key={point} style={{display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5}}>
            <span
              aria-hidden="true"
              className={isBull ? undefined : "hatch"}
              style={{
                flex: "0 0 auto",
                width: 7,
                height: 7,
                marginTop: 8,
                borderRadius: 2,
                border: `1px solid ${isBull ? "var(--green)" : "var(--ink-60)"}`,
                background: isBull ? "var(--green)" : "var(--paper)",
              }}
            />
            {point}
          </li>
        ))}
      </ul>

      <p
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--line)",
          fontSize: 14,
          color: "var(--ink-60)",
        }}
      >
        <span className="eyebrow">Conceded</span>
        <br />
        {conceded}
      </p>
    </section>
  );
}
