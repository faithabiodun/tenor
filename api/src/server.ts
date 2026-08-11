import "dotenv/config";

import cors from "@fastify/cors";
import Fastify from "fastify";
import {DocumentQualityError, priceReceivable} from "@tenor/agents/pipeline";
import {ExtractionSchema} from "@tenor/agents/schemas";
import {SAMPLES, sampleById} from "@tenor/agents/samples";

/**
 * The underwriting service. Holds the model credentials and runs the agent panel, so the
 * browser never sees a key and nobody can call the debate with their own prompts.
 *
 * A debate takes roughly a minute of wall clock, which is why this runs on a long-lived
 * server rather than a serverless function that would time out halfway through the bear.
 */
const app = Fastify({
  logger: {level: process.env.LOG_LEVEL ?? "info"},
  // Three agent round trips, one after the other. The default 0 means no timeout, but be
  // explicit about it: a truncated debate is worse than a slow one.
  requestTimeout: 0,
});

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()) ?? true,
});

app.get("/health", async () => ({ok: true, service: "tenor-api"}));

/** The three synthetic receivables, so the UI can offer them without shipping the PDFs. */
app.get("/samples", async () => ({
  samples: SAMPLES.map(({id, file, expectation, extraction}) => ({
    id,
    file,
    expectation,
    extraction,
  })),
}));

/**
 * Run the debate. Accepts either a sample id or a full extraction the user has reviewed
 * and corrected, which is the human-in-the-loop step from section 7.1.
 */
app.post("/price", async (request, reply) => {
  const body = request.body as {sampleId?: string; extraction?: unknown};

  let extraction;
  if (body?.sampleId) {
    extraction = sampleById(body.sampleId).extraction;
  } else {
    const parsed = ExtractionSchema.safeParse(body?.extraction);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "invalid extraction",
        detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      });
    }
    extraction = parsed.data;
  }

  try {
    const verdict = await priceReceivable(extraction);
    return {
      ...verdict,
      // Hex strings survive JSON; BigInt would not. Nothing here is a BigInt yet, but the
      // mint path will add one, so keep the shape explicit.
      verdictHash: verdict.verdictHash,
    };
  } catch (error) {
    if (error instanceof DocumentQualityError) {
      return reply.code(422).send({error: "document_quality", detail: error.message});
    }
    request.log.error({err: error}, "pricing failed");
    return reply.code(502).send({
      error: "pricing_failed",
      detail: error instanceof Error ? error.message : "unknown error",
    });
  }
});

const port = Number(process.env.PORT ?? 8080);
await app.listen({port, host: "0.0.0.0"});
