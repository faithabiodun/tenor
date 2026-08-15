import {NextResponse} from "next/server";
import {findValuation, storageConfigured} from "../../../../lib/db";

/**
 * Serve a stored valuation by its hash.
 *
 * This is the endpoint the integrity claim rests on. A hash written on chain only commits
 * to reasoning that can still be produced, so the canonical bytes come back exactly as they
 * were hashed, alongside instructions for re-deriving the hash from them. Anyone can check
 * the number was not changed after the fact, without asking us to be believed.
 */
export async function GET(
  _request: Request,
  {params}: {params: Promise<{hash: string}>},
) {
  const {hash} = await params;

  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return NextResponse.json({detail: "That is not a keccak256 hash."}, {status: 400});
  }

  if (!storageConfigured) {
    return NextResponse.json(
      {detail: "This deployment has no storage configured, so nothing was filed to verify."},
      {status: 503},
    );
  }

  const valuation = await findValuation(hash.toLowerCase());
  if (!valuation) {
    return NextResponse.json({detail: "No valuation with that hash."}, {status: 404});
  }

  return NextResponse.json({
    verdict_hash: valuation.verdictHash,
    source_hash: valuation.sourceHash,
    valued_at: valuation.createdAt,
    price_per_share: valuation.pricePerShare,
    projected_term_revenue: valuation.projectedTermRevenue,
    spread: valuation.spread,
    inverted: valuation.inverted,
    how_to_verify: [
      "1. Take the `reasoning` object below.",
      "2. Serialise it as JSON with object keys sorted at every level, array order kept, and no whitespace.",
      "3. keccak256 the UTF-8 bytes of that string.",
      "4. The result must equal verdict_hash. `canonical_json` below is exactly that string, so you can hash it directly to check step 2.",
    ],
    canonical_json: valuation.canonicalJson,
    reasoning: valuation.reasoning,
  });
}
