import type {Hex} from "viem";
import {canonicalise, verdictHash} from "./canonical";
import {ask} from "./llm";
import {
  INVESTOR_SYSTEM,
  NODE_ARBITER_SYSTEM,
  OPERATOR_SYSTEM,
  nodeArbiterUser,
  nodeDebateUser,
} from "./node-prompts";
import {
  DATA_QUALITY_FLOOR,
  InvestorCaseSchema,
  NodeArbiterSchema,
  OperatorCaseSchema,
  type InvestorCase,
  type NodeArbiter,
  type NodeReasoning,
  type OperatorCase,
} from "./node-schemas";
import type {NodeProfile} from "./revenue";

/** Thrown when the observed history is too thin to project from. */
export class DataQualityError extends Error {
  constructor(
    readonly quality: number,
    readonly observedDays: number,
  ) {
    super(
      `This node has ${observedDays} days of observed history, scoring ${quality} out of 100, ` +
        `below the ${DATA_QUALITY_FLOOR} needed to price it. Let it run longer and try again.`,
    );
    this.name = "DataQualityError";
  }
}

export type PanelSeat = "operator" | "investor" | "arbiter";
export type Progress = (seat: PanelSeat, state: "start" | "done") => void;

export interface NodeValuation {
  reasoning: NodeReasoning;
  /** The exact bytes that were hashed. Store verbatim; it is what makes the hash checkable. */
  canonicalJson: string;
  verdictHash: Hex;
  /** mean_monthly × term_months, in whole token units. What the panel is discounting. */
  projectedTermRevenue: number;
  /** What one share costs, in whole token units. */
  pricePerShare: number;
  /** How far apart the two debaters landed, in percentage points. Always positive. */
  spread: number;
  /**
   * True when the operator's advocate came in below the investor, meaning it argued against
   * its own client. That is a broken debate, not a wide one, and an absolute spread hides
   * it: a 15 point inversion looks exactly like a healthy 15 point gap.
   */
  inverted: boolean;
}

/**
 * Quality gate, then the two debaters in parallel, then the arbiter.
 *
 * Running the debaters concurrently roughly halves latency, which matters in a live demo.
 * It is also the honest ordering: neither should see the other's number, or the second one
 * anchors on the first.
 */
export async function priceNode(
  profile: NodeProfile,
  onProgress: Progress = () => {},
): Promise<NodeValuation> {
  if (profile.data_quality < DATA_QUALITY_FLOOR) {
    throw new DataQualityError(profile.data_quality, profile.observed_days);
  }

  const user = nodeDebateUser(profile);

  onProgress("operator", "start");
  onProgress("investor", "start");

  const [operator, investor] = await Promise.all([
    ask<OperatorCase>({
      label: "operator",
      system: OPERATOR_SYSTEM,
      user,
      schema: OperatorCaseSchema,
      temperature: 0.7,
    }).then((result) => {
      onProgress("operator", "done");
      return result;
    }),
    ask<InvestorCase>({
      label: "investor",
      system: INVESTOR_SYSTEM,
      user,
      schema: InvestorCaseSchema,
      temperature: 0.7,
    }).then((result) => {
      onProgress("investor", "done");
      return result;
    }),
  ]);

  onProgress("arbiter", "start");
  const arbiter = await ask<NodeArbiter>({
    label: "arbiter",
    system: NODE_ARBITER_SYSTEM,
    user: nodeArbiterUser(profile, operator, investor),
    schema: NodeArbiterSchema,
    // Cold, so the same debate produces the same verdict. The disagreement is supposed to
    // come from the two debaters, not from sampling noise in the judge.
    temperature: 0,
  });
  onProgress("arbiter", "done");

  // A range handed back the wrong way round is a slip in generation, not a judgement, and
  // the order carries no information worth preserving. Normalise it rather than shipping a
  // panel that reports earnings "between 15 and 11".
  if (arbiter.expected_monthly_low > arbiter.expected_monthly_high) {
    const {expected_monthly_low: lo, expected_monthly_high: hi} = arbiter;
    arbiter.expected_monthly_low = hi;
    arbiter.expected_monthly_high = lo;
  }

  const reasoning: NodeReasoning = {profile, operator, investor, arbiter};

  const projectedTermRevenue = profile.mean_monthly * profile.term_months;
  const pricePerShare =
    (projectedTermRevenue * arbiter.price_rate) / 100 / Math.max(1, profile.shares_total);

  return {
    reasoning,
    canonicalJson: canonicalise(reasoning),
    verdictHash: verdictHash(reasoning),
    projectedTermRevenue,
    pricePerShare,
    spread: Math.abs(operator.proposed_rate - investor.proposed_rate),
    inverted: operator.proposed_rate < investor.proposed_rate,
  };
}
