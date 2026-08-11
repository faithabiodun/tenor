import PDFDocument from "pdfkit";
import {createWriteStream, mkdirSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
import {SAMPLES} from "./documents.js";

/**
 * Render the three synthetic receivables to PDFs in /samples.
 *
 *   npm run samples
 *
 * Monospaced and plain on purpose: these stand in for the scans and exports a freelancer
 * would actually upload, and a text-layer PDF is the easiest thing for the extraction
 * agent to read cleanly.
 */
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../samples");

mkdirSync(OUT_DIR, {recursive: true});

for (const sample of SAMPLES) {
  const path = resolve(OUT_DIR, sample.file);
  const doc = new PDFDocument({size: "A4", margin: 56});
  const done = new Promise<void>((resolveWrite, rejectWrite) => {
    const stream = createWriteStream(path);
    stream.on("finish", resolveWrite);
    stream.on("error", rejectWrite);
    doc.pipe(stream);
  });

  doc.font("Courier").fontSize(10);
  for (const line of sample.lines) {
    doc.text(line, {lineGap: 2});
  }

  doc.moveDown(2).fontSize(7).fillColor("#6B615A");
  doc.text(
    "Synthetic document generated for the Tenor prototype. Every company, person and " +
      "figure above is fictional.",
    {lineGap: 1},
  );

  doc.end();
  await done;

  console.log(`  ${sample.file}`);
}

console.log(`\n  ${SAMPLES.length} samples written to /samples\n`);
