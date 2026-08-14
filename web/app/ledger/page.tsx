import type {Metadata} from "next";
import Link from "next/link";
import {Footer, Header} from "../../components/Chrome";
import {recentVerdicts, storageConfigured} from "../../lib/db";
import type {Arbiter, Bear, Bull, Extraction} from "../../lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ledger — Tenor",
  description: "Every receivable Tenor has priced, and the hash of the argument behind it.",
};

/**
 * Everything priced so far. Public because the verdicts are: the row-level policy on
 * tenor_verdicts allows anonymous reads precisely so an assessment can be checked by
 * someone who does not trust us.
 */
export default async function Ledger() {
  const rows = storageConfigured ? await recentVerdicts(50) : [];

  return (
    <>
      <Header />
      <main className="wrap" style={{paddingTop: 52, paddingBottom: 40}}>
        <h1 style={{fontSize: "clamp(30px, 5.4vw, 48px)", maxWidth: "18ch"}}>
          Everything priced so far.
        </h1>
        <p style={{maxWidth: "62ch", marginTop: 18, fontSize: 18, color: "var(--ink-60)"}}>
          Each row is a real debate. The hash commits to the reasoning behind the rate, and
          every one of them is open to inspection.
        </p>

        {rows.length === 0 ? (
          <div
            style={{
              marginTop: 34,
              padding: "28px 24px",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-lg)",
              background: "var(--surface)",
              maxWidth: "62ch",
            }}
          >
            <p style={{fontSize: 16}}>
              {storageConfigured
                ? "Nothing priced yet."
                : "Verdict storage is not configured on this deployment."}
            </p>
            {storageConfigured && (
              <p style={{marginTop: 10, fontSize: 15, color: "var(--ink-60)"}}>
                <Link href="/price" style={{color: "var(--green-deep)"}}>
                  Price a receivable
                </Link>{" "}
                and it will appear here.
              </p>
            )}
          </div>
        ) : (
          <div
            style={{
              marginTop: 34,
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {rows.map((row, index) => {
              const extraction = row.extraction as Extraction;
              const arbiter = row.arbiter as Arbiter;
              const bull = row.bull as Bull;
              const bear = row.bear as Bear;
              return (
                <Link
                  key={row.verdict_hash}
                  href={`/verdict/${row.verdict_hash}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "6px 20px",
                    alignItems: "baseline",
                    padding: "16px 18px",
                    borderTop: index === 0 ? undefined : "1px solid var(--line)",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <span className="eyebrow">Payer</span>
                    <p style={{fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em"}}>
                      {extraction.client_name ?? "Unnamed"}
                    </p>
                  </div>

                  <div>
                    <span className="eyebrow">Face value</span>
                    <p className="mono" style={{fontSize: 15}}>
                      {extraction.currency ?? ""}{" "}
                      {extraction.amount === null
                        ? "—"
                        : extraction.amount.toLocaleString("en-US")}
                    </p>
                  </div>

                  <div>
                    <span className="eyebrow">Debate</span>
                    <p className="mono" style={{fontSize: 15, color: "var(--ink-60)"}}>
                      {bull.proposed_rate} v {bear.proposed_rate}
                    </p>
                  </div>

                  <div>
                    <span className="eyebrow">Verdict</span>
                    <p
                      className="mono"
                      style={{fontSize: 17, fontWeight: 600, color: "var(--green-deep)"}}
                    >
                      {arbiter.advance_rate}%
                    </p>
                  </div>

                  <div>
                    <span className="eyebrow">Confidence</span>
                    <p className="mono" style={{fontSize: 15, color: "var(--ink-60)"}}>
                      {arbiter.confidence}
                    </p>
                  </div>

                  <div style={{gridColumn: "1 / -1"}}>
                    <p
                      className="mono"
                      style={{fontSize: 11, color: "var(--ink-40)", wordBreak: "break-all"}}
                    >
                      {row.verdict_hash}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
