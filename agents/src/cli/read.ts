import "./env";

import {readFileSync} from "node:fs";
import {NeedsVisionError, extractFromDocument} from "../extract";

/**
 * Read a document the way an upload would be read.
 *
 *   npm run read -- samples/03-contentious.pdf
 *   npm run read -- samples/03-contentious.pdf --text-only
 *
 * --text-only stops after the local PDF parse, so the text layer can be checked without
 * spending a model call.
 */
const path = process.argv[2];
const textOnly = process.argv.includes("--text-only");

if (!path) {
  console.error("\n  usage: npm run read -- <file.pdf> [--text-only]\n");
  process.exit(1);
}

const bytes = new Uint8Array(readFileSync(path));

if (textOnly) {
  const {extractText, getDocumentProxy} = await import("unpdf");
  const {documentHash} = await import("../canonical");
  // Hash before parsing, and hand the parser a copy: see the note in extract.ts.
  const docHash = documentHash(bytes);
  const {text: joined} = await extractText(await getDocumentProxy(new Uint8Array(bytes)), {
    mergePages: true,
  });
  console.log(`\n  ${path}`);
  console.log(`  docHash  ${docHash}`);
  console.log(`  ${joined.replace(/\s+/g, "").length} characters of text layer\n`);
  console.log(joined.trim().split("\n").slice(0, 14).join("\n"));
  console.log("");
  process.exit(0);
}

try {
  const {extraction, docHash, cached} = await extractFromDocument(bytes);
  console.log(`\n  ${path}`);
  console.log(`  docHash  ${docHash}${cached ? "  (extraction from cache)" : ""}`);
  console.log(`  quality  ${extraction.document_quality}\n`);
  console.log(JSON.stringify(extraction, null, 2));
  console.log("");
} catch (error) {
  if (error instanceof NeedsVisionError) {
    console.error(`\n  ${error.message}\n`);
    process.exit(2);
  }
  throw error;
}
