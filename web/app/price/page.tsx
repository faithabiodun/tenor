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
  const [uploading, setUploading] = useState(false);
  const [docHash, setDocHash] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setProblem("");
    setDocHash(null);
    try {
      const form = new FormData();
      form.append("document", file);
      const response = await fetch(`${API_BASE}/extract`, {method: "POST", body: form});
      const data = await response.json();
      if (!response.ok) {
        setProblem(data.detail ?? "That document could not be read.");
        return;
      }
      setChosen({
        id: "upload",
        file: data.filename,
        expectation: "Your document.",
        extraction: data.extraction,
      });
      setDraft(data.extraction);
      setDocHash(data.docHash);
      setPhase("review");
    } catch {
      setProblem("The document could not be uploaded. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    fetch(`${API_BASE}/samples`)
      .then((response) => response.json())
      .then((data: {samples: SampleSummary[]}) => setSamples(data.samples))
      .catch(() => setProblem("Could not load the sample receivables. Try reloading the page."));
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
            <h2 style={{maxWidth: "20ch"}}>Upload a receivable.</h2>
            <p style={{maxWidth: "62ch", marginTop: 14, color: "var(--ink-60)"}}>
              A signed contract or an unpaid invoice, as a PDF. Nothing you upload is stored
              or published; it is read, hashed, and the fields are shown to you for review.
            </p>

            <Dropzone busy={uploading} onFile={upload} />

            {problem && <Problem>{problem}</Problem>}

            <p className="eyebrow" style={{marginTop: 44}}>
              Or price one of the synthetic samples
            </p>

            <div
              style={{
                marginTop: 16,
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
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius)",
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
                style={{
                  marginTop: 24,
                  border: "1px solid var(--green-line)",
                  background: "var(--green-wash)",
                  borderRadius: "var(--radius)",
                  padding: "14px 16px",
                }}
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
                type="number"
                min={0}
                step="0.01"
                value={String(draft.amount ?? "")}
                mono
                onChange={(value) =>
                  setDraft({...draft, amount: value === "" ? null : Number(value)})
                }
              />
              <Select
                label="Currency"
                value={draft.currency ?? ""}
                options={CURRENCIES}
                onChange={(value) => setDraft({...draft, currency: value || null})}
              />
              <Field
                label="Issue date"
                type="date"
                value={draft.issue_date ?? ""}
                mono
                onChange={(value) => setDraft({...draft, issue_date: value || null})}
              />
              <Field
                label="Due date"
                type="date"
                value={draft.due_date ?? ""}
                mono
                onChange={(value) => setDraft({...draft, due_date: value || null})}
              />
              <Field
                label="Payer registration"
                value={draft.payer_identifier ?? ""}
                onChange={(value) => setDraft({...draft, payer_identifier: value || null})}
              />
              <LongField
                label="Prior payment history"
                value={draft.payer_history ?? ""}
                placeholder="Not stated in the document"
                onChange={(value) => setDraft({...draft, payer_history: value || null})}
              />
              <LongField
                label="Payment terms"
                value={draft.payment_terms ?? ""}
                placeholder="Not stated in the document"
                onChange={(value) => setDraft({...draft, payment_terms: value || null})}
              />
            </div>

            {docHash && (
              <p
                className="mono"
                style={{
                  marginTop: 20,
                  fontSize: 12,
                  color: "var(--ink-60)",
                  wordBreak: "break-all",
                }}
              >
                document hash {docHash}
              </p>
            )}

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
                  border: "1px solid var(--line)",
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
                  border: "1px solid var(--line)",
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
                  border: "1px solid var(--line)",
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
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        padding: "14px 16px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 12,
          height: 12,
          border: `1px solid ${filled ? "var(--green)" : "var(--ink-40)"}`,
          background: filled ? "var(--green)" : "var(--paper)",
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

/**
 * A square, hard-edged drop target rather than the usual dashed rounded rectangle. Keyboard
 * reachable: the whole thing is a label wrapping a real file input, so tab and space work
 * without any handler of ours.
 */
function Dropzone({busy, onFile}: {busy: boolean; onFile: (file: File) => void}) {
  const [over, setOver] = useState(false);

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file && !busy) onFile(file);
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 26,
        padding: "46px 20px",
        border: `1px dashed ${over ? "var(--green)" : "var(--green-line)"}`,
        background: over ? "var(--green-wash)" : "var(--surface)",
        borderRadius: "var(--radius-lg)",
        cursor: busy ? "progress" : "pointer",
        textAlign: "center",
        transition: "background 140ms ease, border-color 140ms ease",
      }}
    >
      <input
        type="file"
        accept="application/pdf,.pdf"
        disabled={busy}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
      <strong style={{fontSize: 18, letterSpacing: "-0.01em"}}>
        {busy ? "Reading the document..." : "Drop a PDF here, or choose a file"}
      </strong>
      <span className="mono" style={{fontSize: 13, color: "var(--ink-60)"}}>
        {busy ? "extracting fields" : "PDF up to 8 MB"}
      </span>
    </label>
  );
}

const CONTROL: React.CSSProperties = {
  border: "1px solid var(--line)",
  background: "var(--paper)",
  borderRadius: "var(--radius-md)",
  padding: "11px 12px",
  fontSize: 15,
  width: "100%",
};

/** Currencies a freelance invoice actually turns up in, plus room for anything else. */
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "NGN", "INR", "ZAR"];

function Field({
  label,
  value,
  onChange,
  mono = false,
  type = "text",
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
  type?: "text" | "number" | "date";
  min?: string | number;
  step?: string | number;
}) {
  return (
    <label style={{display: "grid", gap: 6}}>
      <span className="eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        onChange={(event) => onChange(event.target.value)}
        className={mono ? "mono" : undefined}
        style={CONTROL}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  // A value the extractor read off a document may not be in our list. Keep it as an option
  // rather than silently snapping it to something the document never said.
  const all = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <label style={{display: "grid", gap: 6}}>
      <span className="eyebrow">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mono"
        style={CONTROL}
      >
        <option value="">Not stated</option>
        {all.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function LongField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={{display: "grid", gap: 6, gridColumn: "1 / -1"}}>
      <span className="eyebrow">{label}</span>
      <textarea
        value={value}
        rows={2}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={{...CONTROL, resize: "vertical", lineHeight: 1.5}}
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
        borderLeft: "4px solid var(--neg)",
        borderRadius: "var(--radius-md)",
        padding: "13px 16px",
        fontSize: 15,
        maxWidth: "70ch",
      }}
    >
      {children}
    </p>
  );
}
