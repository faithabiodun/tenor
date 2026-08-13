import "server-only";

import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import type {Verdict} from "./types";

/**
 * Persistence for priced receivables.
 *
 * This exists to make the integrity claim mean something. A verdict hash written on chain
 * only commits to the reasoning if the reasoning can still be produced later, so the
 * canonical bytes that were hashed are stored verbatim and served back to anyone who asks.
 *
 * Writes go through the service role, which bypasses row level security. There is
 * deliberately no anon insert policy on any Tenor table: a forged verdict row would break
 * the one property this project is built around. Reads of verdicts are public, because
 * that is the point.
 *
 * Storage is optional. If it is not configured the pipeline still prices, it just cannot
 * be verified afterwards, and the API says so rather than pretending it saved.
 */
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

/** Writes need the service role. Reads only need the publishable key. */
export const writesConfigured = Boolean(url && serviceKey);
export const storageConfigured = Boolean(url && (serviceKey || publishableKey));

let writer: SupabaseClient | null = null;
let reader: SupabaseClient | null = null;

function db(): SupabaseClient | null {
  if (!writesConfigured) return null;
  writer ??= createClient(url!, serviceKey!, {auth: {persistSession: false}});
  return writer;
}

/**
 * Read-side client. Verdict rows are publicly readable by policy, so verification works
 * on a deployment that holds no secret at all. Falls back to the service role when only
 * that is configured.
 */
function dbRead(): SupabaseClient | null {
  if (!url) return null;
  const key = publishableKey ?? serviceKey;
  if (!key) return null;
  reader ??= createClient(url, key, {auth: {persistSession: false}});
  return reader;
}

export interface StoredVerdict {
  verdict_hash: string;
  canonical_json: string;
  extraction: unknown;
  bull: unknown;
  bear: unknown;
  arbiter: unknown;
  advance_value: number | null;
  spread: number | null;
  inverted: boolean;
  created_at: string;
  doc_hash?: string | null;
}

/**
 * Save a priced receivable. Never throws: losing the record is worse than losing the
 * response, but it is not worth failing a debate the user already waited a minute for.
 * Returns whether it landed so the caller can be honest about it.
 */
export async function saveVerdict(
  verdict: Verdict,
  options: {docHash?: string; wallet?: string} = {},
): Promise<boolean> {
  const supabase = db();
  if (!supabase) return false;

  try {
    let documentId: string | null = null;

    if (options.docHash) {
      // Content addressed, so re-uploading the same file reuses the row rather than
      // creating a second identity for identical bytes.
      const {data} = await supabase
        .from("tenor_documents")
        .upsert(
          {doc_hash: options.docHash, user_wallet: options.wallet ?? null},
          {onConflict: "doc_hash"},
        )
        .select("id")
        .single();
      documentId = data?.id ?? null;
    }

    const {reasoning} = verdict;

    if (documentId) {
      await supabase.from("tenor_extractions").insert({
        document_id: documentId,
        payload: reasoning.extraction,
        document_quality: reasoning.extraction.document_quality,
      });
    }

    const {error} = await supabase.from("tenor_verdicts").upsert(
      {
        document_id: documentId,
        extraction: reasoning.extraction,
        bull: reasoning.bull,
        bear: reasoning.bear,
        arbiter: reasoning.arbiter,
        canonical_json: verdict.canonicalJson,
        verdict_hash: verdict.verdictHash,
        advance_value: verdict.advanceValue,
        spread: verdict.spread,
        inverted: verdict.inverted ?? false,
      },
      {onConflict: "verdict_hash"},
    );

    if (error) {
      console.error("saveVerdict failed", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("saveVerdict threw", error);
    return false;
  }
}

/** Fetch a stored verdict by its hash. This is what makes verification self-service. */
export async function findVerdict(hash: string): Promise<StoredVerdict | null> {
  const supabase = dbRead();
  if (!supabase) return null;

  const {data, error} = await supabase
    .from("tenor_verdicts")
    .select(
      "verdict_hash, canonical_json, extraction, bull, bear, arbiter, advance_value, spread, inverted, created_at",
    )
    .eq("verdict_hash", hash.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("findVerdict failed", error.message);
    return null;
  }
  return (data as StoredVerdict) ?? null;
}

/** Most recent verdicts, for a public ledger view. */
export async function recentVerdicts(limit = 20): Promise<StoredVerdict[]> {
  const supabase = dbRead();
  if (!supabase) return [];

  const {data, error} = await supabase
    .from("tenor_verdicts")
    .select(
      "verdict_hash, canonical_json, extraction, bull, bear, arbiter, advance_value, spread, inverted, created_at",
    )
    .order("created_at", {ascending: false})
    .limit(limit);

  if (error) {
    console.error("recentVerdicts failed", error.message);
    return [];
  }
  return (data as StoredVerdict[]) ?? [];
}
