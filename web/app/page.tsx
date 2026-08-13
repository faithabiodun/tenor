import Link from "next/link";
import {Cta, Footer, Header} from "../components/Chrome";
import {DebateView} from "../components/DebateView";
import type {Verdict} from "../lib/types";
import fixture from "../lib/sample-verdict.json";

const sample = fixture as unknown as Verdict;

const FEATURES = [
  {
    title: "Two agents, opposite incentives",
    body: "One argues for the freelancer, one holds the downside. They disagree because they are given different information, not because they were told to.",
  },
  {
    title: "The argument is on the record",
    body: "A hash of the full rationale is written on chain when the price is set, so the reasoning behind a number cannot be quietly rewritten afterwards.",
  },
  {
    title: "Too small to underwrite by hand",
    body: "Assessing a three thousand dollar invoice costs a lender more than the fee it earns. That is why these go unfinanced.",
  },
];

const STEPS = [
  {n: "01", title: "Upload", body: "A signed contract or an unpaid invoice. PDF or a photo."},
  {n: "02", title: "Extract", body: "Fields are read out and shown to you. Correct anything wrong before pricing."},
  {n: "03", title: "Debate", body: "The two agents argue in parallel. A third arbitrates and sets the rate."},
  {n: "04", title: "Mint", body: "The receivable, the document hash and the verdict hash go on X Layer."},
];

const FAQ = [
  {
    q: "What happens to my document?",
    a: "It is hashed so the pricing can be tied to exactly those bytes, and the extracted fields are stored so the reasoning can be reproduced. The document itself is never published on chain.",
  },
  {
    q: "What actually goes on chain?",
    a: "Commitments only: a hash of the document, a hash of the reasoning, the face value, the priced value, the due date, a confidence score and a status. No inference happens on chain.",
  },
  {
    q: "How do I know the reasoning was not changed later?",
    a: "The verdict hash is written at pricing time. Re-canonicalise the stored reasoning, hash it again, and compare. Keys sort at every level, arrays keep their order, no whitespace, then keccak256.",
  },
  {
    q: "Is this real money?",
    a: "No. Tenor is a prototype built for a hackathon. It does not accept funds from real users and every document in the demo is invented.",
  },
];

export default function Landing() {
  return (
    <>
      <Header />

      <main>
        <section
          className="wrap"
          style={{
            padding: "clamp(64px, 12vw, 132px) 0 0",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1 style={{maxWidth: "15ch"}}>
            Get paid for work you have{" "}
            <span className="stroke">
              already done.
              <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M2 8.5C34 3.6 78 1.6 116 2.2c26 .4 54 2.2 82 6.1"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p
            style={{
              maxWidth: "46ch",
              marginTop: 26,
              fontSize: 19,
              lineHeight: 1.55,
              color: "var(--ink-60)",
            }}
          >
            Upload an unpaid invoice. Two agents argue about what it is worth today. A third
            decides, and shows its working.
          </p>

          <div style={{marginTop: 34}}>
            <Link href="/price" style={{textDecoration: "none"}}>
              <Cta>Price a receivable</Cta>
            </Link>
          </div>
        </section>

        <section className="wrap" style={{paddingTop: 72}}>
          <DebateView verdict={sample} />
        </section>

        <section
          style={{
            marginTop: 96,
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            background: "var(--surface)",
          }}
        >
          <div
            className="wrap"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 0,
            }}
          >
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                style={{
                  padding: "40px 26px 44px",
                  borderLeft: index === 0 ? undefined : "1px solid var(--line)",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 30,
                    height: 30,
                    marginBottom: 18,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--green-wash)",
                    border: "1px solid var(--green-line)",
                  }}
                />
                <h3 style={{marginBottom: 10}}>{feature.title}</h3>
                <p style={{fontSize: 15, color: "var(--ink-60)"}}>{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="wrap" style={{paddingTop: 96}}>
          <h2 style={{maxWidth: "16ch"}}>Four steps, about a minute.</h2>
          <ol
            style={{
              listStyle: "none",
              margin: "40px 0 0",
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 28,
            }}
          >
            {STEPS.map((step) => (
              <li key={step.n} style={{borderTop: "2px solid var(--green)", paddingTop: 16}}>
                <span className="mono" style={{fontSize: 13, color: "var(--green-deep)"}}>
                  {step.n}
                </span>
                <h3 style={{margin: "8px 0 8px"}}>{step.title}</h3>
                <p style={{fontSize: 15, color: "var(--ink-60)"}}>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="faq" className="wrap" style={{paddingTop: 96, maxWidth: 860}}>
          <h2>Questions.</h2>
          <div style={{marginTop: 32}}>
            {FAQ.map((item) => (
              <details
                key={item.q}
                style={{borderTop: "1px solid var(--line)", padding: "18px 0"}}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: 17,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    listStyle: "none",
                  }}
                >
                  {item.q}
                </summary>
                <p style={{marginTop: 12, maxWidth: "68ch", color: "var(--ink-60)"}}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
