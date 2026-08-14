import type {Metadata} from "next";
import Link from "next/link";
import {Footer, Header} from "../../../components/Chrome";
import {DebateView} from "../../../components/DebateView";
import {findVerdict, storageConfigured} from "../../../lib/db";
import type {Verdict} from "../../../lib/types";
import {verdictHash as deriveHash} from "@tenor/agents/canonical";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{hash: string}>;
}): Promise<Metadata> {
  const {hash} = await params;
  return {
    title: `Verdict ${hash.slice(0, 10)}… — Tenor`,
    description: "A priced receivable, and the argument behind the number.",
  };
}

/**
 * A permanent, shareable page for one verdict.
 *
 * This is what makes the integrity claim usable rather than merely true. A freelancer can
 * send this link to a client or a lender: here is an independent assessment of the invoice,
 * here is the reasoning in full, and here is proof it has not been edited since it was
 * priced. The hash is re-derived server side on every request, so a tampered row shows as a
 * mismatch instead of quietly rendering.
 */
export default async function VerdictPage({params}: {params: Promise<{hash: string}>}) {
  const {hash} = await params;

  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return <Shell title="That is not a verdict hash.">
      <p style={{color: "var(--ink-60)"}}>
        A verdict hash is 32 bytes, written as <code className="mono">0x</code> followed by
        64 hexadecimal characters.
      </p>
    </Shell>;
  }

  if (!storageConfigured) {
    return <Shell title="Verdict storage is not configured.">
      <p style={{color: "var(--ink-60)"}}>This deployment cannot look verdicts up.</p>
    </Shell>;
  }

  const stored = await findVerdict(hash);

  if (!stored) {
    return <Shell title="No verdict with that hash.">
      <p style={{color: "var(--ink-60)"}}>
        Nothing has been priced under <code className="mono">{hash}</code>. Check the hash,
        or <Link href="/price" style={{color: "var(--green-deep)"}}>price a receivable</Link>.
      </p>
    </Shell>;
  }

  const reasoning = {
    extraction: stored.extraction,
    bull: stored.bull,
    bear: stored.bear,
    arbiter: stored.arbiter,
  };

  const rederived = deriveHash(reasoning);
  const matches = rederived.toLowerCase() === stored.verdict_hash.toLowerCase();

  const verdict = {
    reasoning,
    canonicalJson: stored.canonical_json,
    verdictHash: stored.verdict_hash,
    advanceValue: Number(stored.advance_value ?? 0),
    spread: Number(stored.spread ?? 0),
    inverted: stored.inverted,
  } as unknown as Verdict;

  return (
    <>
      <Header />
      <main className="wrap" style={{paddingTop: 48, paddingBottom: 40}}>
        <p className="eyebrow">Priced {new Date(stored.created_at).toUTCString()}</p>
        <h1 style={{fontSize: "clamp(28px, 5vw, 44px)", marginTop: 10, maxWidth: "18ch"}}>
          The argument behind the number.
        </h1>

        <div
          style={{
            margin: "22px 0 26px",
            padding: "14px 18px",
            border: `1px solid ${matches ? "var(--green-line)" : "var(--neg)"}`,
            background: matches ? "var(--green-wash)" : "transparent",
            borderRadius: "var(--radius)",
            maxWidth: "76ch",
          }}
        >
          <p style={{fontSize: 15, color: matches ? "var(--ink)" : "var(--neg)"}}>
            {matches
              ? "This reasoning still hashes to the value it was recorded under, so it has not been altered since it was priced."
              : "This reasoning does NOT hash to the value it claims. Treat it as untrustworthy."}
          </p>
          <p
            className="mono"
            style={{marginTop: 8, fontSize: 12, color: "var(--ink-60)", wordBreak: "break-all"}}
          >
            {stored.verdict_hash}
          </p>
          <p style={{marginTop: 10, fontSize: 13, color: "var(--ink-60)"}}>
            Check it yourself:{" "}
            <Link href={`/api/verdict/${stored.verdict_hash}`} style={{color: "var(--green-deep)"}}>
              the raw reasoning and canonical bytes
            </Link>{" "}
            are public, and{" "}
            <Link href="/docs#verify" style={{color: "var(--green-deep)"}}>
              the canonicalisation is documented
            </Link>
            .
          </p>
        </div>

        <DebateView verdict={verdict} />
      </main>
      <Footer />
    </>
  );
}

function Shell({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <>
      <Header />
      <main className="wrap" style={{paddingTop: 64, paddingBottom: 60, maxWidth: 760}}>
        <h1 style={{fontSize: "clamp(26px, 4.4vw, 38px)", marginBottom: 14}}>{title}</h1>
        {children}
      </main>
      <Footer />
    </>
  );
}
