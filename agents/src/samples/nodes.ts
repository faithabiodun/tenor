import {buildProfile, type NodeProfile, type Payment, type RevenueHistory} from "../revenue";

/**
 * Fixtures for exercising the panel without waiting on a real node to accumulate history.
 *
 * The payment series are generated from a seeded pseudo-random sequence rather than
 * Math.random, so the same fixture always produces the same profile and therefore the same
 * verdict hash. A fixture whose hash moved between runs would be useless for testing the
 * thing this project is actually about.
 */

const DAY = 86_400;

/** Observation windows end here so the fixtures do not drift as real time passes. */
const WINDOW_END = Math.floor(Date.parse("2026-08-10T00:00:00Z") / 1000);

/** Numerical Recipes LCG. Cheap, deterministic, and adequate for jitter. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function series(opts: {
  seed: number;
  days: number;
  token: string;
  /** Called per day; return null to skip that day entirely, modelling downtime. */
  amountFor: (day: number, rand: () => number) => number | null;
}): {payments: Payment[]; from: number} {
  const rand = seeded(opts.seed);
  const from = WINDOW_END - opts.days * DAY;
  const payments: Payment[] = [];

  for (let day = 0; day < opts.days; day++) {
    const amount = opts.amountFor(day, rand);
    if (amount === null || amount <= 0) continue;
    const at = from + day * DAY + 3600;
    payments.push({
      at,
      amount: Math.round(amount * 1e6) / 1e6,
      token: opts.token,
      reference: `0x${(opts.seed * 1e6 + day).toString(16).padStart(64, "0")}`,
    });
  }

  return {payments, from};
}

/**
 * Every history built here is kept, keyed by payout address.
 *
 * A NodeProfile is derived data and cannot be hashed into a sourceHash, so anything that
 * wants to store or verify a fixture valuation needs the observations the profile came
 * from. Registering on construction keeps the two from drifting apart, which is the whole
 * point of committing to a source hash in the first place.
 */
const HISTORIES = new Map<string, RevenueHistory>();

function history(
  address: string,
  provenance: RevenueHistory["provenance"],
  built: {payments: Payment[]; from: number},
): RevenueHistory {
  const record: RevenueHistory = {
    address,
    provenance,
    observed_from: built.from,
    observed_to: WINDOW_END,
    payments: built.payments,
  };
  HISTORIES.set(address.toLowerCase(), record);
  return record;
}

/** The observations a profile was derived from, for hashing and for storage. */
export function historyFor(payoutAddress: string): RevenueHistory | null {
  return HISTORIES.get(payoutAddress.toLowerCase()) ?? null;
}

/**
 * Mainnet, deliberately.
 *
 * These fixtures were on testnet, and the panel priced them at the floor of the band with
 * the investor pointing out that testnet USDT is not worth anything, so a claim on a stream
 * of it is worth almost nothing either. That was correct: an earnings stream denominated in
 * play money is worthless no matter how reliably it arrives. The fixture was wrong, not the
 * reasoning, and it is also where a real listing would live.
 */
const ONCHAIN: RevenueHistory["provenance"] = {
  kind: "onchain",
  chain: "X Layer",
  chain_id: 196,
  rpc_url: "https://rpc.xlayer.tech",
};

const ATTESTED: RevenueHistory["provenance"] = {
  kind: "attested",
  chain: "Solana",
  source_url: "https://app.getgrass.io/dashboard",
  attested_by: "operator",
};

export interface NodeSample {
  id: string;
  expectation: string;
  profile: NodeProfile;
}

/**
 * Four months of near-daily payments, mild jitter, gently rising. The case where a high
 * rate is genuinely defensible and the operator's advocate should win most of the argument.
 */
const steady = buildProfile(
  history(
    "0x6c3f8a2b91d47e5c0a9b8d7e6f5a4c3b2d1e0f9a",
    ONCHAIN,
    series({
      seed: 12345,
      days: 124,
      // Stablecoin rather than the network's own reward token, because the fixture models an
      // operator who converts and routes payouts to X Layer. Around twelve dollars a month,
      // which is what a residential bandwidth node actually earns.
      token: "USDT",
      amountFor: (day, rand) => 0.38 + day * 0.0009 + rand() * 0.06,
    }),
  ),
  {
    network: "Grass, payouts converted and routed to X Layer",
    hardware: "Residential bandwidth node, 200/40 Mbps fibre",
    term_months: 6,
    shares_total: 100,
    operator_claims: "Uninterrupted since April. Fibre line with a UPS on the router.",
    // Comfortable margin: roughly a third of revenue goes on power and line share, so the
    // operator has a clear reason to keep it running.
    operating_cost_monthly: 4.4,
    utilisation_percent: 78,
    hardware_age_months: 14,
  },
);

/**
 * The contentious one. Same length of record, but rewards halve at the emissions cut and
 * two multi-day outages sit in the middle. Both agents have real material, and the spread
 * should be wide.
 */
const decaying = buildProfile(
  history(
    "0x9e2d7c4a1b8f5e3d0c6a9b7e4d2f1a8c5b3e0d7f",
    ONCHAIN,
    series({
      seed: 777,
      days: 118,
      token: "USDT",
      amountFor: (day, rand) => {
        // Two outages the operator's summary does not mention.
        if (day >= 44 && day <= 52) return null;
        if (day >= 89 && day <= 94) return null;
        // Emissions cut at the halfway mark.
        const base = day < 60 ? 0.61 : 0.29;
        return base + rand() * 0.14;
      },
    }),
  ),
  {
    network: "Grass, payouts converted and routed to X Layer",
    hardware: "Residential bandwidth node, 100/20 Mbps cable",
    term_months: 6,
    shares_total: 100,
    operator_claims: "Consistently one of the stronger earners in my region.",
    // Costs sit above what the node now earns per month after the emissions cut. The margin
    // is gone, which is the real reason to doubt this one: the operator is currently paying
    // to run a machine whose future income they would have already sold.
    operating_cost_monthly: 5.2,
    utilisation_percent: 41,
    hardware_age_months: 38,
  },
);

/**
 * Eleven days, self-reported. This one exists to be refused. If the panel ever prices it,
 * the quality gate has stopped working and the product is lying to people.
 */
const thin = buildProfile(
  history(
    "0x4b1a8e6c3d9f2a7b5e0c8d4a1f6b3e9c7d2a5f8b",
    ATTESTED,
    series({
      seed: 4242,
      days: 11,
      token: "GRASS",
      amountFor: (_day, rand) => 0.5 + rand() * 0.3,
    }),
  ),
  {
    network: "Grass",
    hardware: null,
    term_months: 6,
    shares_total: 100,
    operator_claims: "Just set up but earning well already, projecting strong growth.",
  },
);

export const NODE_SAMPLES: NodeSample[] = [
  {
    id: "steady",
    expectation: "Four months of consistent on-chain payments. Expect a high rate and the operator to prevail.",
    profile: steady,
  },
  {
    id: "decaying",
    expectation: "An emissions cut and two undisclosed outages. Expect a wide spread and the investor to prevail.",
    profile: decaying,
  },
  {
    id: "thin",
    expectation: "Eleven days, self-reported. Expect the quality gate to refuse it outright.",
    profile: thin,
  },
];

export function nodeSampleById(id: string): NodeSample {
  const found = NODE_SAMPLES.find((s) => s.id === id);
  if (!found) {
    throw new Error(`unknown node sample "${id}". try: ${NODE_SAMPLES.map((s) => s.id).join(", ")}`);
  }
  return found;
}
