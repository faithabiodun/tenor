import {canonicalise, verdictHash} from "../canonical";

/** Emit SQL for a genuinely-hashed verdict row, used to exercise the verify endpoint. */
const reasoning = {
  extraction: {client_name: "Halcyon Systems SA", amount: 18500, currency: "USD"},
  bull: {proposed_rate: 92},
  bear: {proposed_rate: 30},
  arbiter: {advance_rate: 62, confidence: 55, which_agent_prevailed: "split"},
};

const hash = verdictHash(reasoning);
const q = (o: unknown) => `$t$${JSON.stringify(o)}$t$`;

console.log(`insert into tenor_verdicts (extraction,bull,bear,arbiter,canonical_json,verdict_hash,advance_value,spread,inverted) values (${q(reasoning.extraction)},${q(reasoning.bull)},${q(reasoning.bear)},${q(reasoning.arbiter)},$t$${canonicalise(reasoning)}$t$,$t$${hash}$t$,11470,62,false) on conflict (verdict_hash) do nothing;`);
console.log(`-- true hash ${hash}`);
