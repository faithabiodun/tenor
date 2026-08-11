import {SAMPLES} from "@tenor/agents/samples";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The three synthetic receivables, so the picker does not need the PDFs shipped to it. */
export async function GET() {
  return Response.json({
    samples: SAMPLES.map(({id, file, expectation, extraction}) => ({
      id,
      file,
      expectation,
      extraction,
    })),
  });
}
