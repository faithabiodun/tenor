import "./env.js";

import {DEBATE_MODEL} from "../llm.js";
import {DocumentQualityError, priceReceivable} from "../pipeline.js";
import {sampleById} from "../samples/documents.js";

/**
 * Run the full debate against a sample and print it.
 *
 *   npm run price -- contentious
 */
const id = process.argv[2] ?? "contentious";

const sample = sampleById(id);

console.log(`\n  ${sample.id}  ·  ${DEBATE_MODEL}`);
console.log(`  ${sample.expectation}\n`);

const started = Date.now();

try {
  const verdict = await priceReceivable(sample.extraction, (agent, state) => {
    if (state === "start") console.log(`  ${agent} thinking...`);
    else console.log(`  ${agent} done`);
  });

  const {bull, bear, arbiter} = verdict.reasoning;
  const currency = sample.extraction.currency ?? "";

  console.log(`\n  THE CASE FOR   ${bull.proposed_rate}%`);
  for (const argument of bull.arguments) console.log(`    · ${argument}`);
  console.log(`    Conceded: ${bull.strongest_counterargument}`);

  console.log(`\n  THE CASE AGAINST   ${bear.proposed_rate}%`);
  for (const risk of bear.risk_factors) console.log(`    · ${risk}`);
  console.log(`    Conceded: ${bear.strongest_point_for_freelancer}`);

  console.log(`\n  VERDICT   ${arbiter.advance_rate}%`);
  console.log(`  ${currency} ${verdict.advanceValue.toLocaleString()} advanced today`);
  console.log(`  confidence ${arbiter.confidence}  ·  ${arbiter.which_agent_prevailed} prevailed`);
  console.log(`  spread ${verdict.spread.toFixed(1)} points`);
  console.log(`\n  ${arbiter.rationale}\n`);
  console.log(`  verdict hash  ${verdict.verdictHash}`);
  console.log(`  canonical json ${verdict.canonicalJson.length} bytes`);
  console.log(`  ${((Date.now() - started) / 1000).toFixed(1)}s\n`);
} catch (error) {
  if (error instanceof DocumentQualityError) {
    console.error(`\n  rejected: ${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
