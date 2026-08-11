import "./env";

import {writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {REPO_ROOT} from "./env";
import {priceReceivable} from "../pipeline";
import {sampleById} from "../samples/documents";

/**
 * Freeze a real debate to a fixture the landing page can render.
 *
 *   npm run snapshot -- contentious
 *
 * The marketing page shows an actual run, not mocked-up copy. If the prompts change and
 * the numbers move, re-run this rather than editing the fixture by hand.
 */
const id = process.argv[2] ?? "contentious";
const out = resolve(REPO_ROOT, "web/lib/sample-verdict.json");

const verdict = await priceReceivable(sampleById(id).extraction, (agent, state) =>
  console.log(`  ${agent} ${state}`),
);

writeFileSync(out, `${JSON.stringify(verdict, null, 2)}\n`, "utf8");

console.log(`\n  ${id}: bull ${verdict.reasoning.bull.proposed_rate}  bear ${verdict.reasoning.bear.proposed_rate}  verdict ${verdict.reasoning.arbiter.advance_rate}%`);
console.log(`  written to ${out}\n`);
