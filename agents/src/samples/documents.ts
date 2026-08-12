import type {Extraction} from "../schemas";

/**
 * Three synthetic receivables (section 10). Every company, person and figure here is
 * invented. Nothing in this directory describes a real client or a real engagement, and
 * nothing real should ever be committed here.
 *
 * Each sample carries both the document text (rendered to a PDF in /samples) and the
 * extraction we expect from it. Keeping them in one file means the seeded extraction and
 * the rendered document cannot drift apart, and lets the debate be tuned before the
 * vision-capable extraction agent is wired up.
 */
export interface Sample {
  id: string;
  file: string;
  /** What we are testing, and what a sane verdict looks like. */
  expectation: string;
  lines: string[];
  extraction: Extraction;
}

export const SAMPLES: Sample[] = [
  {
    id: "clean",
    file: "01-clean-low-risk.pdf",
    expectation: "High rate, agents broadly agree. Known client, short terms, penalty clause.",
    lines: [
      "INVOICE  A-1042",
      "",
      "From:    Mara Ellison, freelance technical writer",
      "         mara@ellison-docs.example",
      "To:      Bellweather Analytics Ltd, 14 Harbour Row, Bristol BS1 4TT",
      "         Company number 07734512  ·  accounts@bellweather-analytics.example",
      "",
      "Issued:  1 August 2026",
      "Due:     31 August 2026  (net 30)",
      "Amount:  USD 4,200.00",
      "",
      "DELIVERABLES  (all delivered and accepted 29 July 2026)",
      "  1. API reference for the Bellweather payments SDK, 42 pages, signed off by",
      "     E. Okafor on 24 July 2026.",
      "  2. Migration guide, v2 to v3, 11 pages, signed off 29 July 2026.",
      "  3. Two rounds of editorial revision, both completed.",
      "",
      "PAYMENT TERMS",
      "  Net 30 from date of issue. This is the fourth engagement between the parties",
      "  under master services agreement BA-MSA-2024-118; the three prior invoices were",
      "  settled within terms (11, 19 and 14 days respectively).",
      "",
      "LATE PAYMENT",
      "  Interest accrues at 2% per month on any balance outstanding after the due date,",
      "  compounding monthly, per clause 9.2 of BA-MSA-2024-118.",
      "",
      "TERMINATION",
      "  Clause 12.1: either party may terminate on 30 days written notice. Work already",
      "  delivered and accepted remains payable in full.",
    ],
    extraction: {
      client_name: "Bellweather Analytics Ltd",
      freelancer_name: "Mara Ellison",
      amount: 4200,
      currency: "USD",
      issue_date: "2026-08-01",
      due_date: "2026-08-31",
      payment_terms: "Net 30 from date of issue, under master services agreement BA-MSA-2024-118",
      payer_history:
        "Fourth engagement between the parties; the three prior invoices were settled " +
        "within terms, in 11, 19 and 14 days",
      payer_identifier: "UK company number 07734512",
      deliverables: [
        "API reference for the Bellweather payments SDK, 42 pages, signed off 24 July 2026",
        "Migration guide v2 to v3, 11 pages, signed off 29 July 2026",
        "Two rounds of editorial revision, both completed",
      ],
      termination_clauses: [
        "Either party may terminate on 30 days written notice; work already delivered and accepted remains payable in full",
      ],
      late_penalty: "2% per month compounding on any balance outstanding after the due date",
      document_quality: 94,
      missing_critical_fields: [],
    },
  },

  {
    id: "messy",
    file: "02-messy-high-risk.pdf",
    expectation: "Low rate. Unknown payer, 90 day terms, vague scope, broad termination, no penalty.",
    lines: [
      "INVOICE",
      "",
      "From:  J. Okonjo",
      "To:    Vantage Digital Holdings",
      "",
      "Date:  20 July 2026",
      "Terms: 90 days",
      "Total: 2,800",
      "",
      "For: marketing support and related services as discussed",
      "",
      "Notes:",
      "  Client may cancel this engagement at any time for any reason, with or without",
      "  notice, and shall not be liable for work in progress or for any amounts not yet",
      "  invoiced at the date of cancellation.",
      "",
      "  Deliverables to be agreed. Scope subject to change at client discretion.",
      "  Acceptance at the sole discretion of the client.",
      "",
      "  Please remit on receipt of instructions.",
    ],
    extraction: {
      client_name: "Vantage Digital Holdings",
      freelancer_name: "J. Okonjo",
      amount: 2800,
      currency: null,
      issue_date: "2026-07-20",
      due_date: "2026-10-18",
      payment_terms: "90 days",
      payer_history: null,
      payer_identifier: null,
      deliverables: ["Marketing support and related services as discussed"],
      termination_clauses: [
        "Client may cancel at any time for any reason, with or without notice",
        "Client not liable for work in progress or amounts not yet invoiced at cancellation",
        "Acceptance at the sole discretion of the client",
      ],
      late_penalty: null,
      document_quality: 58,
      missing_critical_fields: ["currency", "late_penalty", "specific deliverables"],
    },
  },

  {
    id: "contentious",
    file: "03-contentious.pdf",
    expectation:
      "The demo document. Strong contract terms and a large amount, but the payer cannot be " +
      "verified. Bull and bear must land at least 5 points apart (section 7.5).",
    lines: [
      "INVOICE  HS-2026-0071",
      "",
      "From:    Dana Whitfield, independent systems consultant",
      "         dana@whitfield-consulting.example",
      "To:      Halcyon Systems SA",
      "         Registered office stated as: Rue du Marche 8, 1204 Geneva",
      "         No company registration number supplied.",
      "",
      "Issued:  5 August 2026",
      "Due:     19 September 2026  (net 45)",
      "Amount:  USD 18,500.00",
      "",
      "DELIVERABLES  (delivered 4 August 2026, acceptance confirmed by email)",
      "  1. Migration of the Halcyon order pipeline from batch to event-driven,",
      "     including 31 integration tests, all passing at handover.",
      "  2. Runbook and on-call escalation procedure, 24 pages.",
      "  3. Two weeks of post-migration support, completed 4 August 2026.",
      "",
      "PAYMENT TERMS",
      "  Net 45 from date of issue. Fixed fee, agreed in writing before commencement.",
      "  This is the first engagement between the parties.",
      "",
      "LATE PAYMENT",
      "  Interest at 1.5% per month on overdue balances, per clause 7 of the signed",
      "  statement of work dated 2 June 2026.",
      "",
      "TERMINATION",
      "  Clause 11: termination for convenience requires 60 days written notice and does",
      "  not affect fees for work completed and accepted before the notice date.",
      "",
      "COUNTERPARTY NOTES",
      "  Halcyon Systems SA was incorporated within the last eight months. No filed",
      "  accounts are available. The company has no website reachable at the address",
      "  given on the statement of work, and the signatory's authority to bind the",
      "  company has not been independently confirmed.",
    ],
    extraction: {
      client_name: "Halcyon Systems SA",
      freelancer_name: "Dana Whitfield",
      amount: 18500,
      currency: "USD",
      issue_date: "2026-08-05",
      due_date: "2026-09-19",
      payment_terms:
        "Net 45 from date of issue, fixed fee agreed in writing before commencement",
      payer_history: "First engagement between the parties; no prior invoices",
      payer_identifier: null,
      deliverables: [
        "Migration of the Halcyon order pipeline from batch to event-driven, including 31 integration tests passing at handover",
        "Runbook and on-call escalation procedure, 24 pages",
        "Two weeks of post-migration support, completed 4 August 2026",
      ],
      termination_clauses: [
        "Termination for convenience requires 60 days written notice and does not affect fees for work completed and accepted before the notice date",
      ],
      late_penalty: "1.5% per month on overdue balances, per clause 7 of the signed statement of work",
      document_quality: 88,
      missing_critical_fields: [
        "client company registration number",
        "verifiable corporate footprint for the payer",
        "confirmation of signatory authority",
      ],
    },
  },
];

export function sampleById(id: string): Sample {
  const found = SAMPLES.find((sample) => sample.id === id);
  if (!found) {
    throw new Error(`unknown sample "${id}". Known: ${SAMPLES.map((s) => s.id).join(", ")}`);
  }
  return found;
}
