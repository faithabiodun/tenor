import Link from "next/link";
import {Cta, Footer, Header} from "../components/Chrome";
import {DebateView} from "../components/DebateView";
import type {Verdict} from "../lib/types";
import fixture from "../lib/sample-verdict.json";

const sample = fixture as unknown as Verdict;

const FEATURES = [
  {
    title: "Two agents, opposing incentives",
    body: "One argues for the freelancer, one holds the downside. They are kept apart by asymmetric information, not by being told to disagree.",
  },
  {
    title: "The reasoning is the product",
    body: "A hash of the full rationale is written on chain at pricing time, so the argument behind a number cannot be quietly rewritten afterwards.",
  },
  {
    title: "Small receivables, finally priced",
    body: "Manual underwriting costs more than the fee on a three thousand dollar invoice. Automated assessment changes that arithmetic.",
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
        <section className="wrap" style={{padding: "clamp(56px, 11vw, 120px) 0 0"}}>
          <div style={{maxWidth: "18ch"}}>
            <h1>Get paid for work you have already done.</h1>
          </div>
          <p style={{maxWidth: "56ch", marginTop: 22, fontSize: 19, color: "var(--ink-60)"}}>
            Upload an unpaid invoice. Two AI agents with opposing interests argue about what it
            is worth today, and a third decides.
          </p>
          <div style={{marginTop: 30}}>
            <Link href="/price" style={{textDecoration: "none"}}>
              <Cta>Price a receivable</Cta>
            </Link>
          </div>
        </section>

        <section className="wrap" style={{paddingTop: 56}}>
          <p className="eyebrow" style={{marginBottom: 12}}>
            An actual run, not a mockup
          </p>
          <DebateView verdict={sample} />
        </section>

        <section
          style={{
            marginTop: 96,
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
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
                  borderLeft: index === 0 ? undefined : "1px solid var(--rule-soft)",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{width: 22, height: 22, background: "var(--ink)", marginBottom: 18}}
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
              <li key={step.n} style={{borderTop: "1px solid var(--rule)", paddingTop: 16}}>
                <span className="mono" style={{fontSize: 13, color: "var(--ink-40)"}}>
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
                style={{borderTop: "1px solid var(--rule)", padding: "18px 0"}}
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
