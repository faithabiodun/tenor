import "./env";

import {DEBATE_MODEL} from "../llm";
import {nodeSampleById} from "../samples/nodes";
import {DataQualityError, priceNode} from "../valuation";

/**
 * Run the full panel against a node fixture and print it.
 *
 *   npm run price:node -- decaying
 */
const id = process.argv[2] ?? "steady";

const sample = nodeSampleById(id);
const p = sample.profile;

console.log(`\n  ${sample.id}  ·  ${DEBATE_MODEL}`);
console.log(`  ${sample.expectation}\n`);
console.log(
  `  ${p.observed_days} days observed · ${p.payment_count} payments · ` +
    `${p.total_observed} ${p.currency} · volatility ${p.volatility} · ` +
    `trend ${p.trend_percent > 0 ? "+" : ""}${p.trend_percent}% · ` +
    `longest gap ${p.longest_gap_days}d · quality ${p.data_quality}\n`,
);

const started = Date.now();

try {
  const valuation = await priceNode(p, (seat, state) => {
    console.log(state === "start" ? `  ${seat} thinking...` : `  ${seat} done`);
  });

  const {operator, investor, arbiter} = valuation.reasoning;

  console.log(`\n  THE CASE FOR   ${operator.proposed_rate}%`);
  for (const argument of operator.arguments) console.log(`    · ${argument}`);
  console.log(`    Conceded: ${operator.strongest_counterargument}`);

  console.log(`\n  THE CASE AGAINST   ${investor.proposed_rate}%`);
  for (const risk of investor.risk_factors) console.log(`    · ${risk}`);
  console.log(`    Conceded: ${investor.strongest_point_for_operator}`);

  console.log(`\n  VERDICT   ${arbiter.price_rate}%`);
  console.log(
    `  ${valuation.projectedTermRevenue.toFixed(2)} ${p.currency} projected over ` +
      `${p.term_months} months · ${valuation.pricePerShare.toFixed(4)} ${p.currency} per share`,
  );
  console.log(`  confidence ${arbiter.confidence}  ·  ${arbiter.which_agent_prevailed} prevailed`);
  console.log(`  spread ${valuation.spread.toFixed(1)} points${valuation.inverted ? "  INVERTED" : ""}`);
  console.log(`\n  ${arbiter.rationale}\n`);
  for (const lever of arbiter.price_levers) {
    console.log(`  +${lever.worth} pts  ${lever.change}`);
  }
  console.log(`\n  verdict hash  ${valuation.verdictHash}`);
  console.log(`  canonical json ${valuation.canonicalJson.length} bytes`);
  console.log(`  ${((Date.now() - started) / 1000).toFixed(1)}s\n`);
} catch (error) {
  if (error instanceof DataQualityError) {
    console.error(`\n  refused: ${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
