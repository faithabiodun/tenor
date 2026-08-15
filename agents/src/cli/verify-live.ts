import {canonicalise, verdictHash} from "../canonical";

/**
 * Verify a live deployment's stored valuation, the way a sceptic would.
 *
 *   npm run verify:live -- https://uptime-07bq.onrender.com 0xa1fe...
 *
 * Two independent checks, because they can fail separately and mean different things:
 *
 *   1. keccak256 of the served canonical_json must equal the served verdict_hash. If this
 *      fails the hash does not describe the bytes and the commitment is meaningless.
 *   2. Re-canonicalising the served reasoning must reproduce those same bytes. If this
 *      fails the stored reasoning has drifted from what was hashed, which is exactly the
 *      tampering the hash exists to detect.
 */
const [base, hash] = process.argv.slice(2);

if (!base || !hash) {
  console.error("usage: verify:live -- <base-url> <verdict-hash>");
  process.exit(2);
}

const response = await fetch(`${base.replace(/\/$/, "")}/api/valuation/${hash}`);
if (!response.ok) {
  console.error(`  ${response.status} from the deployment: ${(await response.text()).slice(0, 200)}`);
  process.exit(1);
}

const served = await response.json();

const servedBytes: string = served.canonical_json;
const servedHash: string = served.verdict_hash;

const hashOfServedBytes = verdictHash(JSON.parse(servedBytes));
const rebuilt = canonicalise(served.reasoning);
const hashOfRebuilt = verdictHash(served.reasoning);

const bytesMatch = rebuilt === servedBytes;
const hashMatch = hashOfServedBytes.toLowerCase() === servedHash.toLowerCase();
const endToEnd = hashOfRebuilt.toLowerCase() === hash.toLowerCase();

console.log(`\n  requested   ${hash}`);
console.log(`  served      ${servedHash}`);
console.log(`  valued at   ${served.valued_at}`);
console.log(`  source hash ${served.source_hash}`);
console.log(`  canonical   ${servedBytes.length} bytes\n`);

console.log(`  ${hashMatch ? "PASS" : "FAIL"}  keccak256(served canonical_json) == verdict_hash`);
console.log(`  ${bytesMatch ? "PASS" : "FAIL"}  canonicalise(served reasoning) == served canonical_json`);
console.log(`  ${endToEnd ? "PASS" : "FAIL"}  re-derived hash == the hash we asked for\n`);

if (!bytesMatch) {
  // Show where they diverge rather than just asserting they do; a single reordered key is
  // invisible in two 4000 character strings.
  const at = [...rebuilt].findIndex((c, i) => c !== servedBytes[i]);
  console.error(`  first difference at byte ${at}`);
  console.error(`    served:   …${servedBytes.slice(Math.max(0, at - 40), at + 40)}…`);
  console.error(`    rebuilt:  …${rebuilt.slice(Math.max(0, at - 40), at + 40)}…\n`);
}

process.exit(hashMatch && bytesMatch && endToEnd ? 0 : 1);
