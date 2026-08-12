import {NeedsVisionError, extractFromDocument} from "@tenor/agents/extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Uploads are capped well below anything a real invoice needs. */
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Read an uploaded document into the extraction schema, and return the hash of exactly the
 * bytes that were read. The user reviews and corrects the fields before anything is priced,
 * which is the human-in-the-loop step from section 7.1.
 */
export async function POST(request: Request) {
  let file: File | null = null;
  try {
    const form = await request.formData();
    const candidate = form.get("document");
    if (candidate instanceof File) file = candidate;
  } catch {
    return Response.json({error: "expected a multipart form with a document field"}, {status: 400});
  }

  if (!file) return Response.json({error: "no document uploaded"}, {status: 400});
  if (file.size === 0) return Response.json({error: "that file is empty"}, {status: 400});
  if (file.size > MAX_BYTES) {
    return Response.json(
      {error: "too_large", detail: "That file is over 8 MB. Upload a smaller PDF."},
      {status: 413},
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const {extraction, docHash, cached} = await extractFromDocument(bytes);
    return Response.json({extraction, docHash, cached, filename: file.name});
  } catch (error) {
    if (error instanceof NeedsVisionError) {
      return Response.json({error: "needs_vision", detail: error.message}, {status: 422});
    }
    console.error("extraction failed", error);
    return Response.json(
      {
        error: "extraction_failed",
        detail: error instanceof Error ? error.message : "unknown error",
      },
      {status: 502},
    );
  }
}
