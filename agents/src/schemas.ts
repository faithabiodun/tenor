import {z} from "zod";

/** Section 7.1. Null means "not clearly present" — the extractor never guesses. */
export const ExtractionSchema = z.object({
  client_name: z.string().nullable(),
  freelancer_name: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  payment_terms: z.string().nullable(),
  /**
   * Added to section 7.1's schema. The bear's checklist asks about prior payment history
   * and about whether the payer can be identified at all, and the original schema had
   * nowhere to carry either, so every payer read as unverifiable and well-papered invoices
   * priced like risky ones. Null means the document does not say, which is itself a signal
   * the bear is entitled to weigh.
   */
  payer_history: z.string().nullable(),
  payer_identifier: z.string().nullable(),
  deliverables: z.array(z.string()),
  termination_clauses: z.array(z.string()),
  late_penalty: z.string().nullable(),
  document_quality: z.number().int().min(0).max(100),
  missing_critical_fields: z.array(z.string()),
});

/** Section 7.2. The bull argues for the freelancer and never sees the risk checklist. */
export const BullSchema = z.object({
  proposed_rate: z.number().min(0).max(100),
  arguments: z.array(z.string()).min(3),
  strongest_counterargument: z.string().min(1),
});

/** Section 7.3. The bear holds the asset if it goes wrong, and does see the checklist. */
export const BearSchema = z.object({
  proposed_rate: z.number().min(0).max(100),
  risk_factors: z.array(z.string()).min(3),
  strongest_point_for_freelancer: z.string().min(1),
});

/** Section 7.4. advance_rate is banded 50-95; anything outside is rejected and retried. */
export const ArbiterSchema = z.object({
  advance_rate: z.number().min(50).max(95),
  confidence: z.number().int().min(0).max(100),
  rationale: z.string().min(1),
  decisive_arguments: z.array(z.string()).min(1),
  which_agent_prevailed: z.enum(["bull", "bear", "split"]),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
export type Bull = z.infer<typeof BullSchema>;
export type Bear = z.infer<typeof BearSchema>;
export type Arbiter = z.infer<typeof ArbiterSchema>;

/** Everything the arbiter weighed, and the verdict. This object is what gets hashed. */
export interface Reasoning {
  extraction: Extraction;
  bull: Bull;
  bear: Bear;
  arbiter: Arbiter;
}

/** Below this, the document is too poor to price and the pipeline stops (section 7.1). */
export const QUALITY_FLOOR = 40;

/** Section 7.5: on the contentious sample, a spread under this means the debate is fake. */
export const MIN_SPREAD_POINTS = 5;
