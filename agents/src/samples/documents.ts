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
      "Issued:  1 December 2026",
      "Due:     31 December 2026  (net 30)",
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
      issue_date: "2026-12-01",
      due_date: "2026-12-31",
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

/**
 * A fourth document, added for hands-on testing rather than for the tuned test set. It sits
 * between the clean and contentious cases: a real trading company with a registration
 * number, but long terms, a chunky amount and a milestone the client has not signed off.
 * Not covered by the spread assertion, which stays on the three tuned samples.
 */
export const EXTRA_SAMPLE: Sample = {
  id: "photographer",
  file: "04-photographer.pdf",
  expectation: "Mid risk. Verifiable payer, but 60 day terms and an unaccepted milestone.",
  lines: [
    "INVOICE  RS-2026-114",
    "",
    "From:    Ravi Sundaram, commercial photographer",
    "         ravi@sundaram-studio.example  ·  VAT GB 418 7729 03",
    "To:      Meridian Foods Ltd",
    "         Unit 6, Callow Trading Estate, Leeds LS12 6AB",
    "         Company number 09218447",
    "",
    "Issued:  14 July 2026",
    "Due:     12 September 2026  (net 60)",
    "Amount:  GBP 7,450.00",
    "",
    "DELIVERABLES",
    "  1. Product photography, autumn range, 84 finished images.",
    "     Delivered 9 July 2026, accepted in writing 11 July 2026.",
    "  2. Two studio days including lighting hire and one assistant.",
    "     Delivered 2 and 3 July 2026.",
    "  3. Retouching, 84 images to the client's house specification.",
    "     Delivered 12 July 2026. ACCEPTANCE PENDING at date of invoice.",
    "",
    "PAYMENT TERMS",
    "  Net 60 from date of issue, per the framework agreement dated 4 March 2026.",
    "  Second engagement between the parties. The first invoice, MF-2025-088 for",
    "  GBP 2,100, was settled 41 days after issue against 30 day terms.",
    "",
    "LATE PAYMENT",
    "  Statutory interest under the Late Payment of Commercial Debts (Interest)",
    "  Act 1998 applies to overdue sums.",
    "",
    "TERMINATION",
    "  Either party may terminate on 14 days notice. Fees for delivered and",
    "  accepted work remain payable; work delivered but not yet accepted is",
    "  payable only once accepted.",
  ],
  extraction: {
    client_name: "Meridian Foods Ltd",
    freelancer_name: "Ravi Sundaram",
    amount: 7450,
    currency: "GBP",
    issue_date: "2026-07-14",
    due_date: "2026-09-12",
    payment_terms:
      "Net 60 from date of issue, per the framework agreement dated 4 March 2026",
    payer_history:
      "Second engagement; the first invoice, GBP 2,100, was settled 41 days after issue against 30 day terms, so late but paid",
    payer_identifier: "UK company number 09218447",
    deliverables: [
      "Product photography, autumn range, 84 finished images, accepted in writing 11 July 2026",
      "Two studio days including lighting hire and one assistant",
      "Retouching of 84 images to the client's house specification, delivered but acceptance pending",
    ],
    termination_clauses: [
      "Either party may terminate on 14 days notice",
      "Work delivered but not yet accepted is payable only once accepted",
    ],
    late_penalty:
      "Statutory interest under the Late Payment of Commercial Debts (Interest) Act 1998",
    document_quality: 91,
    missing_critical_fields: ["acceptance of the retouching milestone"],
  },
};

/**
 * A creator's brand deal. Included because a sponsorship invoice is the same object as a
 * freelance one — terms, deliverables, an acceptance clause, a payer of unknown quality —
 * and because the risks that are specific to creator work turn out to be covered by the
 * checklist already: approval rights are subjective acceptance criteria, and a takedown
 * clause is a termination clause by another name.
 */
export const CREATOR_SAMPLE: Sample = {
  id: "creator",
  file: "05-creator-sponsorship.pdf",
  expectation:
    "Creator brand deal. Named payer and a signed IO, but payment is gated on brand approval " +
    "and a 12 month takedown right.",
  lines: [
    "INVOICE  NL-2026-0042",
    "",
    "From:    Nadia Leclerc  ·  YouTube: @nadiabuilds (214,000 subscribers)",
    "         nadia@nadiabuilds.example",
    "To:      Kestrel Audio GmbH",
    "         Oranienstrasse 185, 10999 Berlin",
    "         HRB 214877 B  ·  VAT DE317442901",
    "",
    "Issued:  28 July 2026",
    "Due:     26 October 2026  (net 90)",
    "Amount:  EUR 11,200.00",
    "",
    "PER INSERTION ORDER KA-IO-2026-31, SIGNED 2 JULY 2026",
    "",
    "DELIVERABLES",
    "  1. One dedicated long-form video, 8 minutes minimum, featuring the",
    "     Kestrel K7 headphones. Published 21 July 2026.",
    "  2. Two short-form vertical cutdowns, published 22 and 24 July 2026.",
    "  3. One pinned comment with tracking link, live since publication.",
    "  4. Usage rights for Kestrel to reuse all footage in paid media for 12",
    "     months from publication.",
    "",
    "PAYMENT TERMS",
    "  Net 90 from date of issue. First engagement between the parties.",
    "  Clause 4.2: payment becomes due only once Brand has confirmed the",
    "  deliverables meet brand guidelines. Confirmation has been requested",
    "  and is outstanding at the date of this invoice.",
    "",
    "LATE PAYMENT",
    "  None stated in the insertion order.",
    "",
    "TERMINATION AND TAKEDOWN",
    "  Clause 9: Brand may require removal of any deliverable within 12 months",
    "  at its sole discretion. Where removal is required for reasons other than",
    "  Creator breach, fees already invoiced remain payable. Where Brand deems",
    "  the deliverable off-brand, Brand may withhold up to 50% of the fee.",
  ],
  extraction: {
    client_name: "Kestrel Audio GmbH",
    freelancer_name: "Nadia Leclerc",
    amount: 11200,
    currency: "EUR",
    issue_date: "2026-07-28",
    due_date: "2026-10-26",
    payment_terms:
      "Net 90 from date of issue, per insertion order KA-IO-2026-31 signed 2 July 2026. " +
      "Payment falls due only once the brand confirms the deliverables meet brand guidelines, " +
      "and that confirmation is outstanding",
    payer_history: "First engagement between the parties; no prior invoices",
    payer_identifier: "German commercial register HRB 214877 B, VAT DE317442901",
    deliverables: [
      "One dedicated long-form video of at least 8 minutes featuring the Kestrel K7, published 21 July 2026",
      "Two short-form vertical cutdowns, published 22 and 24 July 2026",
      "One pinned comment with tracking link, live since publication",
      "Usage rights for the brand to reuse all footage in paid media for 12 months",
    ],
    termination_clauses: [
      "Brand may require removal of any deliverable within 12 months at its sole discretion",
      "Where the brand deems a deliverable off-brand it may withhold up to 50% of the fee",
      "Fees already invoiced remain payable where removal is not for creator breach",
    ],
    late_penalty: null,
    document_quality: 89,
    missing_critical_fields: [
      "brand confirmation that deliverables meet guidelines",
      "late payment penalty",
    ],
  },
};

/**
 * A platform payout statement rather than an invoice.
 *
 * Earnings for a closed month, payable on a published schedule, are a receivable: the money
 * is owed and the date is known. What differs is where the risk sits. The payer is
 * unimpeachable, so counterparty risk nearly vanishes — but there is no contract to enforce,
 * the platform can revise the figure downward for invalid traffic, and a policy action can
 * withhold the lot. Whether the capital provider finds that on its own is the test.
 */
export const PLATFORM_SAMPLE: Sample = {
  id: "platform",
  file: "06-platform-payout.pdf",
  expectation:
    "Platform payout. Payer is beyond doubt and paid monthly for two years, but there is no " +
    "contract, the figure is revisable and a policy action can withhold it.",
  lines: [
    "PAYMENT STATEMENT",
    "",
    "Publisher:   Tobi Adeyemi  ·  channel @tobibuilds",
    "             Publisher ID pub-4417002391556280",
    "Platform:    Google AdSense for YouTube",
    "",
    "Period:      1 November 2026 to 30 November 2026  (closed)",
    "Issued:      3 December 2026",
    "Payable:     21 December 2026, per the published monthly payment schedule",
    "",
    "EARNINGS FOR THE PERIOD",
    "  Watch page advertising                              USD  3,980.42",
    "  YouTube Premium revenue share                       USD    511.08",
    "  Shorts feed advertising                             USD    338.67",
    "  Invalid traffic adjustment, prior period            USD   -142.19",
    "  ----------------------------------------------------------------",
    "  Balance payable                                     USD  4,687.98",
    "",
    "PAYMENT HISTORY",
    "  Paid on schedule every month since September 2024, 23 consecutive",
    "  payments. Twelve month average USD 4,110.",
    "",
    "TERMS",
    "  Payment is governed by the AdSense Online Terms of Service, not by a",
    "  negotiated contract. There is no late payment provision and no agreed",
    "  remedy for delay.",
    "",
    "  Earnings shown remain subject to revision. Google may adjust or reverse",
    "  amounts attributed to invalid traffic at any time before or after payment.",
    "",
    "  Payment may be withheld or the account terminated for breach of the",
    "  YouTube monetisation policies, at Google's determination. The channel",
    "  currently holds no active strikes.",
  ],
  extraction: {
    client_name: "Google AdSense for YouTube",
    freelancer_name: "Tobi Adeyemi",
    amount: 4687.98,
    currency: "USD",
    issue_date: "2026-12-03",
    due_date: "2026-12-21",
    payment_terms:
      "Payable 21 December 2026 under the published monthly AdSense payment schedule, governed " +
      "by the AdSense Online Terms of Service rather than a negotiated contract",
    payer_history:
      "Paid on schedule every month since September 2024, 23 consecutive payments, twelve " +
      "month average USD 4,110",
    payer_identifier: "Publisher ID pub-4417002391556280 with Google AdSense",
    deliverables: [
      "Watch page advertising revenue for the closed period, USD 3,980.42",
      "YouTube Premium revenue share, USD 511.08",
      "Shorts feed advertising, USD 338.67",
      "Invalid traffic adjustment carried from the prior period, USD -142.19",
    ],
    termination_clauses: [
      "Earnings remain subject to revision; Google may adjust or reverse amounts attributed to invalid traffic at any time, before or after payment",
      "Payment may be withheld or the account terminated for breach of the YouTube monetisation policies, at Google's determination",
    ],
    late_penalty: null,
    document_quality: 93,
    missing_critical_fields: ["negotiated contract", "late payment remedy"],
  },
};

/** Offered in the app alongside the tuned three, but not part of the assertion set. */
export const EXTRA_SAMPLES: Sample[] = [EXTRA_SAMPLE, CREATOR_SAMPLE, PLATFORM_SAMPLE];

export function sampleById(id: string): Sample {
  const found = [...SAMPLES, ...EXTRA_SAMPLES].find((sample) => sample.id === id);
  if (!found) {
    throw new Error(
      `unknown sample "${id}". Known: ${[...SAMPLES, ...EXTRA_SAMPLES].map((s) => s.id).join(", ")}`,
    );
  }
  return found;
}
