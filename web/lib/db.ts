import "server-only";

import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import type {NodeReasoning} from "@uptime/agents/node-schemas";
import type {RevenueHistory} from "@uptime/agents/revenue";

/**
 * Persistence for priced nodes.
 *
 * This exists to make the integrity claim mean something. A hash written on chain only
 * commits to something if that something can still be produced later, so the canonical bytes
 * that were hashed are stored verbatim and served back to anyone who asks.
 *
 * Writes go through the service role, which bypasses row level security. There is
 * deliberately no anon insert policy on any Uptime table: a forged valuation row would break
 * the one property this project is built around. Reads are public, because that is the point.
 *
 * Storage is optional. Without it the panel still runs, it just cannot be verified
 * afterwards, and the API says so rather than pretending it saved.
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
 * Read-side client. Node and valuation rows are publicly readable by policy, so verification
 * works on a deployment holding no secret at all. Falls back to the service role when only
 * that is configured.
 */
function ro(): SupabaseClient | null {
  if (!storageConfigured) return null;
  reader ??= createClient(url!, (publishableKey ?? serviceKey)!, {
    auth: {persistSession: false},
  });
  return reader;
}

export interface StoredValuation {
  verdictHash: string;
  sourceHash: string | null;
  reasoning: NodeReasoning;
  canonicalJson: string;
  pricePerShare: number | null;
  projectedTermRevenue: number | null;
  spread: number | null;
  inverted: boolean;
  createdAt: string | null;
}

/**
 * Save a node and the argument that priced it.
 *
 * Never throws. A valuation that succeeded but could not be filed is still a valuation, and
 * losing it to a storage outage would be worse than serving it unsaved — the caller is told
 * what happened and can say so in the response.
 */
export async function saveValuation(input: {
  history: RevenueHistory;
  sourceHash: string;
  reasoning: NodeReasoning;
  canonicalJson: string;
  verdictHash: string;
  pricePerShare: number;
  projectedTermRevenue: number;
  spread: number;
  inverted: boolean;
}): Promise<{saved: boolean; reason?: string}> {
  const client = db();
  if (!client) return {saved: false, reason: "storage is not configured"};

  const {profile} = input.reasoning;

  try {
    // Upsert on source_hash: the same observations hashed twice are one node, not two.
    const {data: node, error: nodeError} = await client
      .from("uptime_nodes")
      .upsert(
        {
          source_hash: input.sourceHash,
          payout_address: profile.payout_address,
          chain: profile.chain,
          chain_id: input.history.provenance.kind === "onchain"
            ? input.history.provenance.chain_id
            : null,
          verifiable: profile.verifiable,
          network: profile.network,
          hardware: profile.hardware,
          term_months: profile.term_months,
          shares_total: profile.shares_total,
          history: input.history,
        },
        {onConflict: "source_hash"},
      )
      .select("id")
      .single();

    if (nodeError) return {saved: false, reason: nodeError.message};

    const {error} = await client.from("uptime_valuations").upsert(
      {
        node_id: node?.id ?? null,
        source_hash: input.sourceHash,
        profile,
        operator_case: input.reasoning.operator,
        investor_case: input.reasoning.investor,
        arbiter: input.reasoning.arbiter,
        canonical_json: input.canonicalJson,
        verdict_hash: input.verdictHash,
        price_rate: input.reasoning.arbiter.price_rate,
        price_per_share: input.pricePerShare,
        projected_term_revenue: input.projectedTermRevenue,
        confidence: input.reasoning.arbiter.confidence,
        spread: input.spread,
        inverted: input.inverted,
      },
      {onConflict: "verdict_hash"},
    );

    if (error) return {saved: false, reason: error.message};
    return {saved: true};
  } catch (error) {
    return {saved: false, reason: error instanceof Error ? error.message : "unknown error"};
  }
}

/** Fetch one valuation by its hash. This is the self-service verification path. */
export async function findValuation(verdictHash: string): Promise<StoredValuation | null> {
  const client = ro();
  if (!client) return null;

  const {data, error} = await client
    .from("uptime_valuations")
    .select(
      "verdict_hash, source_hash, profile, operator_case, investor_case, arbiter, " +
        "canonical_json, price_per_share, projected_term_revenue, spread, inverted, created_at",
    )
    .eq("verdict_hash", verdictHash)
    .maybeSingle();

  if (error || !data) return null;
  return shape(data);
}

/** The most recent valuations, for a public ledger view. */
export async function recentValuations(limit = 12): Promise<StoredValuation[]> {
  const client = ro();
  if (!client) return [];

  const {data, error} = await client
    .from("uptime_valuations")
    .select(
      "verdict_hash, source_hash, profile, operator_case, investor_case, arbiter, " +
        "canonical_json, price_per_share, projected_term_revenue, spread, inverted, created_at",
    )
    .order("created_at", {ascending: false})
    .limit(limit);

  if (error || !data) return [];
  return data.map(shape);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function shape(row: any): StoredValuation {
  return {
    verdictHash: row.verdict_hash,
    sourceHash: row.source_hash ?? null,
    // Reassembled in the same key order the pipeline built it in. Canonicalisation sorts
    // keys anyway, so the hash does not depend on this, but keeping the shape identical
    // means a reader comparing the two by eye sees the same object.
    reasoning: {
      profile: row.profile,
      operator: row.operator_case,
      investor: row.investor_case,
      arbiter: row.arbiter,
    },
    canonicalJson: row.canonical_json,
    pricePerShare: row.price_per_share,
    projectedTermRevenue: row.projected_term_revenue,
    spread: row.spread,
    inverted: Boolean(row.inverted),
    createdAt: row.created_at ?? null,
  };
}
