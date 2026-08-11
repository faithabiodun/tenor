import "./env";

import {DEBATE_MODEL} from "../llm";
import {priceReceivable} from "../pipeline";
import {MIN_SPREAD_POINTS} from "../schemas";
import {SAMPLES, sampleById} from "../samples/documents";

/**
 * Section 7.5's dev-only assertion. The known failure mode of this whole design is that
 * the bull and bear agree: LLMs are agreeable by nature, and a debate where both sides say
 * the same thing destroys the pitch. Catch it here during prompt tuning, not in the demo.
 *
 *   npm run spread            # the contentious sample, asserts a real disagreement
 *   npm run spread -- --all   # every sample, reports but only asserts on contentious
 */
const all = process.argv.includes("--all");
const targets = all ? SAMPLES : [sampleById("contentious")];

console.log(`\n  spread check  ·  ${DEBATE_MODEL}\n`);

let failed = false;

for (const sample of targets) {
  const verdict = await priceReceivable(sample.extraction);
  const {bull, bear, arbiter} = verdict.reasoning;

  const asserted = sample.id === "contentious";
  const ok = !asserted || verdict.spread >= MIN_SPREAD_POINTS;
  if (!ok) failed = true;

  console.log(
    `  ${ok ? "pass" : "FAIL"}  ${sample.id.padEnd(12)}` +
      `bull ${String(bull.proposed_rate).padStart(5)}  ` +
      `bear ${String(bear.proposed_rate).padStart(5)}  ` +
      `spread ${verdict.spread.toFixed(1).padStart(5)}  ` +
      `verdict ${arbiter.advance_rate}%  conf ${arbiter.confidence}`,
  );

  if (!ok) {
    console.log(
      `\n  The bull and bear landed ${verdict.spread.toFixed(1)} points apart on the sample\n` +
        `  that is supposed to divide them, under the ${MIN_SPREAD_POINTS} point floor.\n` +
        `  Do not ship this: tighten the role framing in prompts.ts, or raise the debate\n` +
        `  temperature in pipeline.ts. Adding information to the bear is fair game; giving\n` +
        `  the bull the risk checklist is not, that symmetry is what causes this.\n`,
    );
  }
}

console.log("");
process.exit(failed ? 1 : 0);
