import {readFileSync} from "node:fs";
import type {Hex} from "viem";
import {canonicalise, verdictHash, verifyVerdictHash} from "../canonical";

/**
 * Verify that a stored reasoning JSON really does hash to the value written on chain.
 *
 *   npm run verify -- reasoning.json 0x8f3a...
 *   npm run verify                              # worked example, no arguments needed
 *
 * This is the check that makes the integrity claim checkable by someone who does not
 * trust us: read verdictHash off the contract, fetch the stored reasoning, re-derive.
 */
const [file, expected] = process.argv.slice(2);

if (!file) {
  const demo = {b: 2, a: [3, 1], c: {z: null, y: "x"}};
  console.log("\n  Worked example\n");
  console.log(`  input      ${JSON.stringify(demo)}`);
  console.log(`  canonical  ${canonicalise(demo)}`);
  console.log(`  keccak256  ${verdictHash(demo)}\n`);
  console.log("  Keys sort at every level, array order is preserved, no whitespace.\n");
  process.exit(0);
}

const reasoning: unknown = JSON.parse(readFileSync(file, "utf8"));
const derived = verdictHash(reasoning);

console.log(`\n  file      ${file}`);
console.log(`  derived   ${derived}`);

if (!expected) {
  console.log("");
  process.exit(0);
}

console.log(`  expected  ${expected}`);

if (verifyVerdictHash(reasoning, expected as Hex)) {
  console.log("\n  match: this reasoning is the reasoning that was priced.\n");
  process.exit(0);
}

console.log("\n  MISMATCH: this JSON is not what produced that hash.\n");
process.exit(1);
