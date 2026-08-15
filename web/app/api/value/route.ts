import {NextResponse} from "next/server";
import {historyFor, nodeSampleById} from "@uptime/agents/node-samples";
import {revenueSourceHash} from "@uptime/agents/revenue";
import {DataQualityError, priceNode} from "@uptime/agents/valuation";
import {saveValuation, writesConfigured} from "../../../lib/db";

/** The panel makes three model calls; the arbiter waits on both debaters. */
export const maxDuration = 300;

/**
 * Run the panel against a node and return the whole argument, not just the number.
 *
 * The canonical JSON goes back verbatim rather than being re-serialised on the client,
 * because it is the exact string the hash commits to. Rebuilding it in the browser would
 * risk shipping a payload whose own instructions do not reproduce its own hash.
 */
export async function POST(request: Request) {
  let sampleId: string;
  try {
    ({sampleId} = await request.json());
  } catch {
    return NextResponse.json({detail: "Expected a json body."}, {status: 400});
  }

  let sample;
  try {
    sample = nodeSampleById(sampleId);
  } catch {
    return NextResponse.json({detail: `Unknown node "${sampleId}".`}, {status: 404});
  }

  try {
    const valuation = await priceNode(sample.profile);

    // The observations the profile came from, so the valuation can be filed against a
    // source hash rather than against a number nobody can trace back.
    const history = historyFor(sample.profile.payout_address);
    const sourceHash = history ? revenueSourceHash(history) : null;

    let stored: {saved: boolean; reason?: string} = {
      saved: false,
      reason: writesConfigured ? "no revenue history for this node" : "storage is not configured",
    };

    if (history && sourceHash) {
      stored = await saveValuation({
        history,
        sourceHash,
        reasoning: valuation.reasoning,
        canonicalJson: valuation.canonicalJson,
        verdictHash: valuation.verdictHash,
        pricePerShare: valuation.pricePerShare,
        projectedTermRevenue: valuation.projectedTermRevenue,
        spread: valuation.spread,
        inverted: valuation.inverted,
      });
    }

    return NextResponse.json({
      id: sample.id,
      profile: valuation.reasoning.profile,
      reasoning: valuation.reasoning,
      canonicalJson: valuation.canonicalJson,
      verdictHash: valuation.verdictHash,
      sourceHash,
      pricePerShare: valuation.pricePerShare,
      projectedTermRevenue: valuation.projectedTermRevenue,
      spread: valuation.spread,
      inverted: valuation.inverted,
      // Reported rather than swallowed. A valuation that priced but did not file is still a
      // valuation, and the UI should be able to say it cannot be verified later.
      stored: stored.saved,
      storedReason: stored.saved ? undefined : stored.reason,
    });
  } catch (error) {
    // A refusal is a correct outcome, not a server fault, so it gets its own status and its
    // own message rather than being flattened into a 500.
    if (error instanceof DataQualityError) {
      return NextResponse.json({detail: error.message, refused: true}, {status: 422});
    }
    const detail = error instanceof Error ? error.message : "The panel could not be run.";
    return NextResponse.json({detail}, {status: 502});
  }
}
