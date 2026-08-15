import {createPublicClient, http, keccak256, parseAbiItem, toBytes, type Hex} from "viem";
import {canonicalise} from "./canonical";

/**
 * Where a node's earnings are read from.
 *
 * `onchain` is the honest case: we query the chain ourselves, and anyone can repeat the
 * query and get the same answer. Nothing is being taken on trust.
 *
 * `attested` covers earnings that settle somewhere we cannot read from inside a single
 * EVM call — a Grass wallet on Solana, an operator's dashboard export. It is a weaker
 * claim and the type says so, because a valuation built on attested data has an oracle in
 * it whether or not anyone admits that. The provenance fields exist so a reader can go and
 * check the source for themselves rather than trusting our copy of it.
 */
export type Provenance =
  | {kind: "onchain"; chain: string; chain_id: number; rpc_url: string}
  | {kind: "attested"; chain: string; source_url: string; attested_by: string};

export interface Payment {
  /** Unix seconds. Block timestamp for on-chain reads. */
  at: number;
  /** Whole token units, already scaled by decimals. */
  amount: number;
  token: string;
  reference: string;
}

/** The raw observation. This is what gets hashed into sourceHash. */
export interface RevenueHistory {
  address: string;
  provenance: Provenance;
  observed_from: number;
  observed_to: number;
  payments: Payment[];
}

/**
 * What the agent panel actually reads. Everything here is derived from the payments by
 * pure arithmetic, so it can be recomputed and disputed rather than believed.
 */
export interface NodeProfile {
  network: string | null;
  hardware: string | null;
  payout_address: string;
  chain: string;
  verifiable: boolean;
  currency: string;

  observed_days: number;
  payment_count: number;
  total_observed: number;
  mean_monthly: number;
  /** Coefficient of variation across months. Above ~0.5 the income is not dependable. */
  volatility: number;
  /** The longest silence between payments. A proxy for downtime the operator did not mention. */
  longest_gap_days: number;
  /** Last observed month against the first, as a percentage. Negative means decaying rewards. */
  trend_percent: number;
  /**
   * `complete` says whether the observation window covered the whole month. The first and
   * last entries are usually partial, and a partial month read as a full one looks like a
   * collapse in earnings that never happened. Both debaters worked this out for themselves
   * from the dates, which is exactly the kind of inference they should not have to make.
   */
  months: Array<{month: string; total: number; complete: boolean}>;

  term_months: number;
  shares_total: number;
  operator_claims: string | null;

  /**
   * What the machine costs to run each month, and what is left after that.
   *
   * These are not deducted from what investors receive: the operator pays the power bill,
   * and holders have a claim on revenue delivered, not on profit. Costs matter for a
   * different and more important reason. When net approaches zero the operator's reason to
   * keep the machine running disappears, and nothing in the arrangement compels them to.
   * So this is a risk input, not an accounting line.
   */
  operating_cost_monthly: number | null;
  net_monthly: number | null;
  /** How hard the machine is worked. Low utilisation on a compute node means idle capacity. */
  utilisation_percent: number | null;
  /** Age in months. Hardware does not get faster, and the term runs into its future. */
  hardware_age_months: number | null;

  /** 0-100. Thin history is the single biggest reason a valuation should not be trusted. */
  data_quality: number;
  missing_critical_fields: string[];
}

const TRANSFER = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);

const DECIMALS_ABI = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{type: "uint8"}],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{type: "string"}],
  },
] as const;

/** Public RPCs cap how many blocks a single eth_getLogs may span. */
const CHUNK = 9_000n;

/**
 * Read ERC-20 payments into an address directly from the chain.
 *
 * Native-token transfers are deliberately not covered: finding them means either scanning
 * every block or trusting an explorer's index, and an explorer index is exactly the kind
 * of unverifiable middleman this project exists to avoid. DePIN rewards are paid as tokens
 * in practice, so this is where the real revenue is anyway.
 */
export async function readOnchainRevenue(opts: {
  address: Hex;
  chain: {id: number; name: string};
  rpcUrl: string;
  /** How far back to look. Roughly 2s per block on X Layer, so 1.3M blocks is about a month. */
  lookbackBlocks: bigint;
}): Promise<RevenueHistory> {
  const client = createPublicClient({transport: http(opts.rpcUrl)});

  const head = await client.getBlockNumber();
  const start = head > opts.lookbackBlocks ? head - opts.lookbackBlocks : 0n;

  const raw: Array<{token: Hex; value: bigint; block: bigint; tx: Hex}> = [];
  for (let from = start; from <= head; from += CHUNK) {
    const to = from + CHUNK - 1n > head ? head : from + CHUNK - 1n;
    const logs = await client.getLogs({
      event: TRANSFER,
      args: {to: opts.address},
      fromBlock: from,
      toBlock: to,
    });
    for (const log of logs) {
      if (log.args.value === undefined || log.blockNumber === null) continue;
      raw.push({
        token: log.address,
        value: log.args.value,
        block: log.blockNumber,
        tx: log.transactionHash!,
      });
    }
  }

  // Token metadata and block times are looked up once per distinct value, because a node
  // paid daily for a month is 30 logs across maybe one token and 30 blocks.
  const meta = new Map<Hex, {decimals: number; symbol: string}>();
  for (const token of new Set(raw.map((r) => r.token))) {
    meta.set(token, await tokenMeta(client, token));
  }

  const times = new Map<bigint, number>();
  for (const block of new Set(raw.map((r) => r.block))) {
    const {timestamp} = await client.getBlock({blockNumber: block});
    times.set(block, Number(timestamp));
  }

  const payments: Payment[] = raw
    .map((r) => {
      const m = meta.get(r.token)!;
      return {
        at: times.get(r.block)!,
        amount: Number(r.value) / 10 ** m.decimals,
        token: m.symbol,
        reference: r.tx,
      };
    })
    // Ascending time, and tx hash as the tiebreak so two payments in one block always
    // canonicalise the same way regardless of the order the RPC returned them in.
    .sort((a, b) => a.at - b.at || a.reference.localeCompare(b.reference));

  const startBlock = await client.getBlock({blockNumber: start});

  return {
    address: opts.address.toLowerCase(),
    provenance: {
      kind: "onchain",
      chain: opts.chain.name,
      chain_id: opts.chain.id,
      rpc_url: opts.rpcUrl,
    },
    observed_from: Number(startBlock.timestamp),
    observed_to: Math.floor(Date.now() / 1000),
    payments,
  };
}

const DAY = 86_400;

/**
 * Turn observed payments into the profile the panel argues over.
 *
 * Every number here is arithmetic on the payment list, never a judgement. Judgement is the
 * agents' job, and keeping the two apart is what lets a sceptic recompute this from the
 * same history and get the same figures.
 */
export function buildProfile(
  history: RevenueHistory,
  meta: {
    network: string | null;
    hardware: string | null;
    term_months: number;
    shares_total: number;
    operator_claims: string | null;
    operating_cost_monthly?: number | null;
    utilisation_percent?: number | null;
    hardware_age_months?: number | null;
  },
): NodeProfile {
  const {payments} = history;
  const observedDays = Math.max(1, Math.round((history.observed_to - history.observed_from) / DAY));

  const byMonth = new Map<string, number>();
  for (const p of payments) {
    const month = new Date(p.at * 1000).toISOString().slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + p.amount);
  }
  const months = [...byMonth.entries()]
    .map(([month, total]) => ({
      month,
      total: round(total),
      complete:
        Date.parse(`${month}-01T00:00:00Z`) / 1000 >= history.observed_from &&
        monthEnd(month) <= history.observed_to,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const meanMonthly = total / (observedDays / 30);

  // Only whole months are comparable. The first and last months of an observation window
  // are partial by construction, and including them makes a node look wildly volatile and
  // wildly trending purely because of where the window happened to fall. Both figures go
  // straight into the investor's prompt, so a partial-month artefact would not just be
  // noise, it would be an argument.
  const whole = months.filter((m) => m.complete);
  const comparable = whole.length >= 2 ? whole : months;

  const totals = comparable.map((m) => m.total);
  const mean = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  const variance = totals.length
    ? totals.reduce((sum, t) => sum + (t - mean) ** 2, 0) / totals.length
    : 0;
  const volatility = mean > 0 ? Math.sqrt(variance) / mean : 0;

  // Gaps are measured from the start of the window, not just between payments, so a node
  // that produced nothing for its first three weeks cannot hide it.
  let longestGap = payments.length ? payments[0]!.at - history.observed_from : observedDays * DAY;
  for (let i = 1; i < payments.length; i++) {
    longestGap = Math.max(longestGap, payments[i]!.at - payments[i - 1]!.at);
  }
  if (payments.length) {
    longestGap = Math.max(longestGap, history.observed_to - payments[payments.length - 1]!.at);
  }

  // Zero, not a guess, when there are fewer than two whole months to compare. A node with
  // no comparable history has no trend, and saying so is better than inventing one.
  const trend =
    whole.length >= 2 && whole[0]!.total > 0
      ? ((whole[whole.length - 1]!.total - whole[0]!.total) / whole[0]!.total) * 100
      : 0;

  const missing: string[] = [];
  if (!meta.network) missing.push("network");
  if (!meta.hardware) missing.push("hardware");
  if (payments.length === 0) missing.push("payments");
  if (history.provenance.kind === "attested") missing.push("independently_verifiable_source");

  return {
    network: meta.network,
    hardware: meta.hardware,
    payout_address: history.address,
    chain: history.provenance.chain,
    verifiable: history.provenance.kind === "onchain",
    currency: payments[0]?.token ?? "unknown",

    observed_days: observedDays,
    payment_count: payments.length,
    total_observed: round(total),
    mean_monthly: round(meanMonthly),
    volatility: round(volatility, 3),
    longest_gap_days: round(longestGap / DAY, 1),
    trend_percent: round(trend, 1),
    months,

    term_months: meta.term_months,
    shares_total: meta.shares_total,
    operator_claims: meta.operator_claims,

    operating_cost_monthly: meta.operating_cost_monthly ?? null,
    net_monthly:
      meta.operating_cost_monthly == null
        ? null
        : round(meanMonthly - meta.operating_cost_monthly),
    utilisation_percent: meta.utilisation_percent ?? null,
    hardware_age_months: meta.hardware_age_months ?? null,

    data_quality: dataQuality(observedDays, payments.length, history.provenance.kind),
    missing_critical_fields: missing,
  };
}

/**
 * How much this history can carry.
 *
 * Length of observation dominates on purpose. Six payments over six months tells you far
 * more about a node than sixty over six days, and a valuation drawn from a week of data is
 * a guess wearing a number's clothes.
 */
function dataQuality(days: number, count: number, kind: Provenance["kind"]): number {
  if (count === 0) return 0;
  const span = Math.min(60, (days / 90) * 60); // 90 days of history earns full marks
  const density = Math.min(25, (count / 30) * 25); // 30 payments earns full marks
  const verifiable = kind === "onchain" ? 15 : 0;
  return Math.round(span + density + verifiable);
}

/** Unix seconds of the last instant of a "YYYY-MM" month. */
function monthEnd(month: string): number {
  const [year, m] = month.split("-").map(Number);
  return Date.UTC(year!, m!, 1) / 1000 - 1;
}

function round(n: number, dp = 6): number {
  const f = 10 ** dp;
  // Guard against -0 and float dust reaching the canonical JSON, where they would change
  // the hash for no observable reason.
  return Object.is(Math.round(n * f) / f, -0) ? 0 : Math.round(n * f) / f;
}

/**
 * keccak256 over the canonical revenue history. This is the vault's sourceHash: it pins
 * the exact observations the valuation was drawn from, so a later claim of "the node was
 * always earning that" can be checked against what was actually seen at pricing time.
 */
export function revenueSourceHash(history: RevenueHistory): Hex {
  return keccak256(toBytes(canonicalise(history)));
}

async function tokenMeta(
  client: ReturnType<typeof createPublicClient>,
  token: Hex,
): Promise<{decimals: number; symbol: string}> {
  try {
    const [decimals, symbol] = await Promise.all([
      client.readContract({address: token, abi: DECIMALS_ABI, functionName: "decimals"}),
      client.readContract({address: token, abi: DECIMALS_ABI, functionName: "symbol"}),
    ]);
    return {decimals: Number(decimals), symbol};
  } catch {
    // Not every token implements the optional metadata methods. 18 decimals is the near
    // universal default, and a truncated address is a more useful label than a throw.
    return {decimals: 18, symbol: `${token.slice(0, 6)}…${token.slice(-4)}`};
  }
}
