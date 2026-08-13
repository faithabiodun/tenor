import {DocumentQualityError, priceReceivable} from "@tenor/agents/pipeline";
import {ExtractionSchema} from "@tenor/agents/schemas";
import {sampleById} from "@tenor/agents/samples";
import {saveVerdict} from "../../../lib/db";

/**
 * The underwriting endpoint. Runs server side so the model credentials stay on the server
 * and nobody can drive the agent panel with their own prompts.
 *
 * Node runtime, not edge: the pipeline uses Node APIs and a debate takes about a minute of
 * wall clock across three sequential model round trips. Railway runs a long-lived server
 * with no request ceiling, which is the reason this can live in the app at all.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  let body: {sampleId?: string; extraction?: unknown; docHash?: string; wallet?: string};
  try {
    body = await request.json();
  } catch {
    return Response.json({error: "invalid json"}, {status: 400});
  }

  let extraction;
  if (body?.sampleId) {
    try {
      extraction = sampleById(body.sampleId).extraction;
    } catch {
      return Response.json({error: "unknown sample"}, {status: 404});
    }
  } else {
    const parsed = ExtractionSchema.safeParse(body?.extraction);
    if (!parsed.success) {
      return Response.json(
        {
          error: "invalid extraction",
          detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        },
        {status: 400},
      );
    }
    extraction = parsed.data;
  }

  try {
    const verdict = await priceReceivable(extraction);

    // Persisting is what lets the on-chain hash be checked later. It is not allowed to
    // fail the request: the debate already cost the user a minute of waiting, so record
    // whether it landed and let the response say so honestly.
    const stored = await saveVerdict(verdict, {docHash: body?.docHash, wallet: body?.wallet});

    return Response.json({...verdict, stored});
  } catch (error) {
    if (error instanceof DocumentQualityError) {
      return Response.json({error: "document_quality", detail: error.message}, {status: 422});
    }
    console.error("pricing failed", error);
    return Response.json(
      {
        error: "pricing_failed",
        detail: error instanceof Error ? error.message : "unknown error",
      },
      {status: 502},
    );
  }
}
