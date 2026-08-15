import {z} from "zod";
import type {NodeProfile} from "./revenue";

/**
 * The operator's advocate. Argues for the highest price a share can defensibly carry,
 * expressed as a percentage of projected term earnings.
 */
export const OperatorCaseSchema = z.object({
  proposed_rate: z.number().min(0).max(100),
  arguments: z.array(z.string()).min(3),
  strongest_counterargument: z.string().min(1),
});

/** The investor. Holds the shares if the node goes dark, and sees the risk checklist. */
export const InvestorCaseSchema = z.object({
  proposed_rate: z.number().min(0).max(100),
  risk_factors: z.array(z.string()).min(3),
  strongest_point_for_operator: z.string().min(1),
});

export const NodeArbiterSchema = z.object({
  /**
   * Percentage of projected term earnings a buyer pays up front. Banded 20-85: unlike an
   * invoice there is no debtor under any obligation to pay, so the floor sits far lower,
   * and no node's future is certain enough to justify paying near full value for it.
   */
  price_rate: z.number().min(20).max(85),
  confidence: z.number().int().min(0).max(100),
  /**
   * The node's own quality, 0-100, independent of what a share costs.
   *
   * Separate from confidence on purpose: confidence is how sure the panel is about its own
   * number, and the score is how good the machine is. A long, clean, verifiable record of a
   * decaying node earns high confidence in a low score, and collapsing the two would hide
   * exactly that case.
   */
  node_score: z.number().int().min(0).max(100),
  /**
   * The range next month's earnings are expected to fall in. A range rather than a point
   * estimate because a point estimate implies a precision no projection has, and a buyer
   * deciding on one deserves to see the width of the uncertainty.
   */
  expected_monthly_low: z.number().min(0),
  expected_monthly_high: z.number().min(0),
  rationale: z.string().min(1),
  decisive_arguments: z.array(z.string()).min(1),
  which_agent_prevailed: z.enum(["operator", "investor", "split"]),
  /**
   * What would move the number, and by how much. Same discipline as the receivable version:
   * a point estimate forces a specific lever instead of "improve reliability".
   */
  price_levers: z
    .array(
      z.object({
        change: z.string().min(1),
        worth: z.number().min(0).max(40),
      }),
    )
    .min(1)
    .max(3),
});

export type OperatorCase = z.infer<typeof OperatorCaseSchema>;
export type InvestorCase = z.infer<typeof InvestorCaseSchema>;
export type NodeArbiter = z.infer<typeof NodeArbiterSchema>;

/** Everything the arbiter weighed, and the verdict. This object is what gets hashed. */
export interface NodeReasoning {
  profile: NodeProfile;
  operator: OperatorCase;
  investor: InvestorCase;
  arbiter: NodeArbiter;
}

/**
 * Below this the history is too thin to project from and the panel refuses.
 *
 * This floor is the honest half of the product. A node with nine days of history can be
 * given a number, and the number will look exactly as confident as any other, which is
 * precisely why refusing is worth more than pricing it.
 */
export const DATA_QUALITY_FLOOR = 25;

/** Under this, the two agents did not really disagree and the debate was theatre. */
export const MIN_SPREAD_POINTS = 5;
