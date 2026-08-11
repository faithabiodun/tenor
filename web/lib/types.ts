export interface Extraction {
  client_name: string | null;
  freelancer_name: string | null;
  amount: number | null;
  currency: string | null;
  issue_date: string | null;
  due_date: string | null;
  payment_terms: string | null;
  deliverables: string[];
  termination_clauses: string[];
  late_penalty: string | null;
  document_quality: number;
  missing_critical_fields: string[];
}

export interface Bull {
  proposed_rate: number;
  arguments: string[];
  strongest_counterargument: string;
}

export interface Bear {
  proposed_rate: number;
  risk_factors: string[];
  strongest_point_for_freelancer: string;
}

export interface Arbiter {
  advance_rate: number;
  confidence: number;
  rationale: string;
  decisive_arguments: string[];
  which_agent_prevailed: "bull" | "bear" | "split";
}

export interface Verdict {
  reasoning: {extraction: Extraction; bull: Bull; bear: Bear; arbiter: Arbiter};
  canonicalJson: string;
  verdictHash: string;
  advanceValue: number;
  spread: number;
}

/** Same origin: the agent panel runs in this app's route handlers. */
export const API_BASE = "/api";

export function money(amount: number, currency: string | null): string {
  const formatted = amount.toLocaleString("en-US", {maximumFractionDigits: 0});
  return currency ? `${currency} ${formatted}` : formatted;
}

export function daysUntil(due: string | null): number | null {
  if (!due) return null;
  const ms = new Date(`${due}T00:00:00Z`).getTime() - Date.now();
  return Math.max(0, Math.round(ms / 86_400_000));
}
