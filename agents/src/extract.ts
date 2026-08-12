import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {extractText, getDocumentProxy} from "unpdf";
import type {Hex} from "viem";
import {documentHash} from "./canonical";
import {ask} from "./llm";
import {ExtractionSchema, type Extraction} from "./schemas";

/**
 * Raised when a document carries no usable text layer, which means it is a scan or a photo
 * and can only be read by a vision-capable model. DeepSeek does not expose image input on
 * its public API, so that path needs a different provider and a different key.
 */
export class NeedsVisionError extends Error {
  constructor() {
    super(
      "This looks like a scan or a photo rather than a text PDF. Reading it needs a " +
        "vision model, which is not configured yet. Upload a PDF exported from your " +
        "invoicing tool and it will read cleanly.",
    );
    this.name = "NeedsVisionError";
  }
}

/** Below this many characters of real text, treat the PDF as a scan. */
const TEXT_LAYER_FLOOR = 200;

const EXTRACTION_SYSTEM = `You read freelance invoices and contracts and pull out the facts.
You are not judging the receivable; someone else does that. Your only job is accuracy.

The single most important rule: return null for anything that is not clearly stated in the
document. Do not guess, do not infer, do not fill a plausible value. A null is a useful
signal to the people downstream. An invented value corrupts the whole assessment.

You are reading text taken from a PDF's text layer, so legibility is not in question. Score
document_quality on how complete and coherent the document is as a receivable: does it name
both parties, state an amount and a currency, give dates and terms, and describe what was
delivered. A tidy invoice with every field present scores in the nineties. Something with no
amount, no dates and a one-line scope scores below forty.

List in missing_critical_fields anything a lender would need and the document does not give.

Reply with a single json object and nothing else. No prose outside the json, no markdown
fences.

Shape:
{
  "client_name": "string or null",
  "freelancer_name": "string or null",
  "amount": 4200,
  "currency": "USD",
  "issue_date": "2026-08-01",
  "due_date": "2026-08-31",
  "payment_terms": "string or null",
  "payer_history": "string or null",
  "payer_identifier": "string or null",
  "deliverables": ["string"],
  "termination_clauses": ["string"],
  "late_penalty": "string or null",
  "document_quality": 94,
  "missing_critical_fields": ["string"]
}

amount is a number in whole currency units, or null. Dates are YYYY-MM-DD, or null. If the
document gives payment terms in days rather than a due date, work the due date out from the
issue date and say so in payment_terms.

payer_history is any prior payment record with this payer, for example "fourth engagement,
three prior invoices settled within terms". payer_identifier is a company registration
number or equivalent that would let someone confirm the payer exists. Both are null when
the document does not say, and null is the honest answer.`;

export interface ExtractionResult {
  extraction: Extraction;
  /** keccak256 of the uploaded bytes, exactly as uploaded. */
  docHash: Hex;
  /** How the text was obtained. Vision lands when a key for it exists. */
  source: "text-layer";
  cached: boolean;
}

/**
 * Read an uploaded document into the extraction schema.
 *
 * Text-layer PDFs are parsed locally and only the text goes to the model, which is cheaper
 * and more faithful than asking a model to read pixels. Scans and photos raise
 * NeedsVisionError rather than silently returning a hollow extraction.
 */
export async function extractFromDocument(
  bytes: Uint8Array,
  options: {cacheDir?: string} = {},
): Promise<ExtractionResult> {
  const docHash = documentHash(bytes);

  const cached = readCache(docHash, options.cacheDir);
  if (cached) return {extraction: cached, docHash, source: "text-layer", cached: true};

  const text = await readTextLayer(bytes);
  if (text.replace(/\s+/g, "").length < TEXT_LAYER_FLOOR) throw new NeedsVisionError();

  const extraction = await ask<Extraction>({
    label: "extraction",
    system: EXTRACTION_SYSTEM,
    user: `Document text:\n\n${text}\n\nExtract it and reply with your json object.`,
    schema: ExtractionSchema,
    temperature: 0,
  });

  writeCache(docHash, extraction, options.cacheDir);
  return {extraction, docHash, source: "text-layer", cached: false};
}

async function readTextLayer(bytes: Uint8Array): Promise<string> {
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  if (header !== "%PDF-") throw new NeedsVisionError();

  try {
    // pdf.js transfers the underlying ArrayBuffer to its worker, which DETACHES the array
    // it was handed: the caller's view silently becomes zero-length. Hash the wrong side of
    // that and every document commits to keccak256("") instead of to itself. Give it a copy
    // so the caller's bytes survive and hashing order stops being load-bearing.
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    // mergePages narrows the return to a single string.
    const {text} = await extractText(pdf, {mergePages: true});
    return text;
  } catch {
    throw new NeedsVisionError();
  }
}

/**
 * Section 12: cache by document hash. Prompt tuning re-runs the debate dozens of times
 * against the same handful of documents, and re-extracting each time is exactly where an
 * AI budget disappears. Content-addressed, so a changed document is a different key.
 */
function cacheFile(docHash: Hex, cacheDir?: string): string {
  return resolve(cacheDir ?? resolve(process.cwd(), ".cache/extractions"), `${docHash}.json`);
}

function readCache(docHash: Hex, cacheDir?: string): Extraction | null {
  try {
    const parsed = ExtractionSchema.safeParse(
      JSON.parse(readFileSync(cacheFile(docHash, cacheDir), "utf8")),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeCache(docHash: Hex, extraction: Extraction, cacheDir?: string): void {
  try {
    const path = cacheFile(docHash, cacheDir);
    mkdirSync(resolve(path, ".."), {recursive: true});
    writeFileSync(path, `${JSON.stringify(extraction, null, 2)}\n`, "utf8");
  } catch {
    // A cache that cannot be written is a performance problem, not a correctness one.
  }
}
