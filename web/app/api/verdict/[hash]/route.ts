import {verdictHash as deriveHash} from "@tenor/agents/canonical";
import {findVerdict, storageConfigured} from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Look up a stored verdict by its hash and re-derive that hash from the stored reasoning,
 * server side, before answering.
 *
 * This is the endpoint the integrity claim rests on. Anyone can read verdictHash off the
 * contract, call this, and get back the exact canonical bytes that were hashed plus an
 * independent confirmation that they still hash to the same value. The check is redone on
 * every request rather than trusted from the row, so a tampered database row reports itself
 * as a mismatch instead of quietly serving a lie.
 */
export async function GET(
  _request: Request,
  context: {params: Promise<{hash: string}>},
) {
  const {hash} = await context.params;

  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return Response.json(
      {error: "invalid_hash", detail: "Expected a 0x-prefixed 32 byte keccak256 hash."},
      {status: 400},
    );
  }

  if (!storageConfigured) {
    return Response.json(
      {
        error: "storage_unavailable",
        detail: "Verdict storage is not configured on this deployment.",
      },
      {status: 503},
    );
  }

  const stored = await findVerdict(hash);
  if (!stored) {
    return Response.json(
      {error: "not_found", detail: "No verdict recorded with that hash."},
      {status: 404},
    );
  }

  const reasoning = {
    extraction: stored.extraction,
    bull: stored.bull,
    bear: stored.bear,
    arbiter: stored.arbiter,
  };

  const rederived = deriveHash(reasoning);
  const matches = rederived.toLowerCase() === stored.verdict_hash.toLowerCase();

  return Response.json(
    {
      verdictHash: stored.verdict_hash,
      rederivedHash: rederived,
      matches,
      canonicalJson: stored.canonical_json,
      reasoning,
      advanceValue: stored.advance_value,
      spread: stored.spread,
      inverted: stored.inverted,
      pricedAt: stored.created_at,
      howToVerify:
        "Canonicalise the reasoning object with keys sorted at every level, array order " +
        "preserved and no whitespace, then keccak256 the UTF-8 bytes. It must equal " +
        "verdictHash.",
    },
    // A mismatch is a server-side integrity failure, not a client error, and should be
    // loud rather than a quiet 200 with a false flag buried in the body.
    {status: matches ? 200 : 500},
  );
}
