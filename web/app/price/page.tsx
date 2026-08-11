"use client";

import {useEffect, useState} from "react";
import {Cta, Footer, Header} from "../../components/Chrome";
import {DebateView} from "../../components/DebateView";
import {API_BASE, type Extraction, type Verdict} from "../../lib/types";

interface SampleSummary {
  id: string;
  file: string;
  expectation: string;
  extraction: Extraction;
}

type Phase = "choose" | "review" | "pricing" | "done" | "error";

export default function PricePage() {
  const [samples, setSamples] = useState<SampleSummary[]>([]);
  const [chosen, setChosen] = useState<SampleSummary | null>(null);
  const [draft, setDraft] = useState<Extraction | null>(null);
  const [phase, setPhase] = useState<Phase>("choose");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/samples`)
      .then((response) => response.json())
      .then((data: {samples: SampleSummary[]}) => setSamples(data.samples))
      .catch(() =>
        setProblem(
          `Could not reach the underwriting service at ${API_BASE}. If you are running ` +
            `locally, start it with npm run dev --workspace api.`,
        ),
      );
  }, []);

  async function price() {
    if (!draft) return;
    setPhase("pricing");
    setProblem("");
    try {
      const response = await fetch(`${API_BASE}/price`, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({extraction: draft}),
      });
      const data = await response.json();
      if (!response.ok) {
        setProblem(data.detail ?? "The pricing service rejected this receivable.");
        setPhase("error");
        return;
      }
      setVerdict(data as Verdict);
      setPhase("done");
    } catch {
      setProblem("The pricing service did not respond. It may still be starting up.");
      setPhase("error");
    }
  }

  return (
    <>
      <Header />
      <main className="wrap" style={{paddingTop: 48, paddingBottom: 40}}>
        {phase === "choose" && (
          <>
            <h2 style={{maxWidth: "20ch"}}>Choose a receivable to price.</h2>
            <p style={{maxWidth: "62ch", marginTop: 14, color: "var(--ink-60)"}}>
              Three synthetic documents, all fictional. Uploading your own arrives with the
              extraction agent; today the debate runs on reviewed fields.
            </p>

            {problem && <Problem>{problem}</Problem>}

            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 18,
              }}
            >
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setChosen(sample);
                    setDraft(sample.extraction);
                    setPhase("review");
                  }}
                  style={{
                    textAlign: "left",
                    background: "var(--paper)",
                    border: "1px solid var(--rule)",
                    padding: "20px 18px 22px",
                    cursor: "pointer",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <span className="mono" style={{fontSize: 12, color: "var(--ink-40)"}}>
                    {sample.file}
                  </span>
                  <strong style={{fontSize: 17, letterSpacing: "-0.01em"}}>
                    {sample.extraction.client_name ?? "Unnamed payer"}
                  </strong>
                  <span className="mono" style={{fontSize: 15}}>
                    {sample.extraction.currency ?? ""}{" "}
                    {sample.extraction.amount?.toLocaleString() ?? "?"}
                  </span>
                  <span style={{fontSize: 14, color: "var(--ink-60)"}}>{sample.expectation}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {phase === "review" && draft && (
          <>
            <h2 style={{maxWidth: "20ch"}}>Check the extracted fields.</h2>
            <p style={{maxWidth: "62ch", marginTop: 14, color: "var(--ink-60)"}}>
              Correct anything that is wrong. You stay in charge of the inputs; the agents only
              do the judgement.
            </p>

            {draft.missing_critical_fields.length > 0 && (
              <div
                className="checker"
                style={{marginTop: 24, border: "1px solid var(--rule)", padding: "14px 16px"}}
              >
                <span className="eyebrow">Flagged as missing</span>
                <p style={{fontSize: 15}}>{draft.missing_critical_fields.join(" · ")}</p>
              </div>
            )}

            <div
              style={{
                marginTop: 26,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 18,
              }}
            >
              <Field
                label="Client"
                value={draft.client_name ?? ""}
                onChange={(value) => setDraft({...draft, client_name: value || null})}
              />
              <Field
                label="Freelancer"
                value={draft.freelancer_name ?? ""}
                onChange={(value) => setDraft({...draft, freelancer_name: value || null})}
              />
              <Field
                label="Amount"
                value={String(draft.amount ?? "")}
                mono
                onChange={(value) =>
                  setDraft({...draft, amount: value === "" ? null : Number(value)})
                }
              />
              <Field
                label="Currency"
                value={draft.currency ?? ""}
                mono
                onChange={(value) => setDraft({...draft, currency: value || null})}
              />
              <Field
                label="Issue date"
                value={draft.issue_date ?? ""}
                mono
                onChange={(value) => setDraft({...draft, issue_date: value || null})}
              />
              <Field
                label="Due date"
                value={draft.due_date ?? ""}
                mono
                onChange={(value) => setDraft({...draft, due_date: value || null})}
              />
            </div>

            <div style={{marginTop: 30, display: "flex", gap: 14, alignItems: "center"}}>
              <button
                onClick={price}
                style={{background: "none", border: "none", padding: 0, cursor: "pointer"}}
              >
                <Cta>Price this receivable</Cta>
              </button>
              <button
                onClick={() => {
                  setChosen(null);
                  setPhase("choose");
                }}
                style={{
                  background: "none",
                  border: "1px solid var(--rule)",
                  padding: "15px 20px",
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            </div>
          </>
        )}

        {phase === "pricing" && <Pricing name={chosen?.extraction.client_name ?? "this receivable"} />}

        {phase === "error" && (
          <>
            <h2>That did not price.</h2>
            <Problem>{problem}</Problem>
            <div style={{marginTop: 24}}>
              <button
                onClick={() => setPhase("review")}
                style={{
                  background: "none",
                  border: "1px solid var(--rule)",
                  padding: "13px 20px",
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Back to the fields
              </button>
            </div>
          </>
        )}

        {phase === "done" && verdict && (
          <>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 20}}>
              <h2 style={{fontSize: 28}}>The verdict.</h2>
              <button
                onClick={() => {
                  setVerdict(null);
                  setChosen(null);
                  setPhase("choose");
                }}
                style={{
                  background: "none",
                  border: "1px solid var(--rule)",
                  padding: "9px 16px",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Price another
              </button>
            </div>
            <DebateView verdict={verdict} />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

/**
 * Per-agent progress rather than one undifferentiated spinner, because the two debaters
 * genuinely run at the same time and the arbiter genuinely waits for both.
 */
function Pricing({name}: {name: string}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const arbiterActive = elapsed > 22;

  return (
    <div style={{paddingTop: 20}}>
      <h2 style={{maxWidth: "22ch"}}>Arguing about {name}.</h2>
      <div style={{marginTop: 34, display: "grid", gap: 1, maxWidth: 560}}>
        <Row label="The case for" active={!arbiterActive} done={arbiterActive} filled />
        <Row label="The case against" active={!arbiterActive} done={arbiterActive} />
        <Row label="Arbiter" active={arbiterActive} done={false} filled />
      </div>
      <p className="mono" style={{marginTop: 22, fontSize: 13, color: "var(--ink-40)"}}>
        {elapsed}s · a debate takes about a minute
      </p>
    </div>
  );
}

function Row({
  label,
  active,
  done,
  filled = false,
}: {
  label: string;
  active: boolean;
  done: boolean;
  filled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        border: "1px solid var(--rule)",
        padding: "14px 16px",
      }}
    >
      <span
        aria-hidden="true"
        className={filled ? undefined : "hatch"}
        style={{
          width: 12,
          height: 12,
          border: "1px solid var(--ink)",
          background: filled ? "var(--ink)" : "var(--paper)",
          opacity: active || done ? 1 : 0.25,
        }}
      />
      <span style={{fontSize: 15}}>{label}</span>
      <span className="mono" style={{marginLeft: "auto", fontSize: 13, color: "var(--ink-60)"}}>
        {done ? "done" : active ? "thinking" : "queued"}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) {
  return (
    <label style={{display: "grid", gap: 6}}>
      <span className="eyebrow">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={mono ? "mono" : undefined}
        style={{
          border: "1px solid var(--rule)",
          background: "var(--paper)",
          padding: "11px 12px",
          fontSize: 15,
          width: "100%",
        }}
      />
    </label>
  );
}

function Problem({children}: {children: React.ReactNode}) {
  return (
    <p
      style={{
        marginTop: 20,
        border: "1px solid var(--neg)",
        borderLeft: "6px solid var(--neg)",
        padding: "13px 16px",
        fontSize: 15,
        maxWidth: "70ch",
      }}
    >
      {children}
    </p>
  );
}
