import type {Metadata} from "next";
import {Footer, Header} from "../../components/Chrome";

export const metadata: Metadata = {
  title: "Docs — Tenor",
  description:
    "How Tenor prices a receivable, what it writes on chain, and how to verify a verdict " +
    "hash yourself.",
};

const CONTENTS = [
  ["what", "What Tenor does"],
  ["agents", "The four agents"],
  ["chain", "What goes on chain"],
  ["verify", "Verifying a verdict"],
  ["trust", "Who can do what"],
  ["limits", "What this is not"],
] as const;

export default function Docs() {
  return (
    <>
      <Header />
      <main className="wrap" style={{paddingTop: 56, paddingBottom: 24}}>
        <h1 style={{fontSize: "clamp(34px, 5.4vw, 54px)", maxWidth: "16ch"}}>
          How Tenor works.
        </h1>
        <p style={{maxWidth: "62ch", marginTop: 20, fontSize: 19, color: "var(--ink-60)"}}>
          Enough detail to check the claims rather than take them on trust.
        </p>

        <nav
          aria-label="Contents"
          style={{
            marginTop: 34,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {CONTENTS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                fontSize: 14,
                textDecoration: "none",
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: "7px 15px",
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <Section id="what" title="What Tenor does">
          <P>
            A freelancer finishes a job, invoices for a few thousand on 60 day terms, and waits
            two months to be paid for work already delivered. Invoice financing exists, but a
            lender assessing a three thousand dollar receivable spends more on the assessment
            than it earns in fees, so nobody does it and small receivables go unfinanced.
          </P>
          <P>
            Tenor prices one automatically. You upload the invoice or contract, the fields are
            read out and shown to you for correction, and then two agents with opposing
            interests argue about what it is worth today. A third weighs both and sets an
            advance rate.
          </P>
        </Section>

        <Section id="agents" title="The four agents">
          <P>
            A single model asked to price an asset anchors on the face value, shaves off a
            plausible percentage, and returns a confident number with nothing behind it. Two
            agents with opposing interests surface what one pass misses.
          </P>
          <Dl
            items={[
              [
                "Extraction",
                "Reads the document into a fixed schema. Returns null for anything not clearly stated rather than guessing, and scores the document for completeness. Below 40 the pipeline stops and asks for a better copy.",
              ],
              [
                "The case for",
                "Represents the freelancer and argues for the highest defensible advance. Its number is a ceiling, not a considered middle. It must also name the strongest argument against its own position.",
              ],
              [
                "The case against",
                "The capital provider, who holds the asset if it goes bad. Works through a risk checklist covering payer identity, payment history, terms length, termination breadth and missing fields. It must also name the strongest point in the freelancer's favour.",
              ],
              [
                "Arbiter",
                "Sees the document and both arguments, and sets a rate between 50 and 95 with a confidence score. Confidence drops when the two are far apart or when fields are missing. The rationale is written for someone with no finance background.",
              ],
            ]}
          />
          <Callout>
            The two debaters are kept apart by <strong>asymmetric information</strong>, not by
            being told to disagree. The risk checklist lives in the capital provider&rsquo;s
            prompt and there is no code path that shows it to the other side. Instructing two
            models to argue produces theatre; giving them different information produces a real
            disagreement.
          </Callout>
        </Section>

        <Section id="chain" title="What goes on chain">
          <P>
            Inference happens off chain. The contract stores commitments only, so there is no
            attempt to run a model on a blockchain.
          </P>
          <Table
            rows={[
              ["docHash", "keccak256 of the uploaded document bytes"],
              ["verdictHash", "keccak256 of the canonical reasoning JSON"],
              ["faceValue", "what the client owes, in minor units"],
              ["advanceValue", "the agent-priced value today, in minor units"],
              ["dueDate", "when payment is due, unix seconds"],
              ["confidence", "0 to 100, from the arbiter"],
              ["status", "Priced, Funded, Repaid or Defaulted, forward only"],
            ]}
          />
          <P>
            The document itself is never published. Only its hash is, which is enough to tie a
            price to exactly those bytes without revealing what they say.
          </P>
        </Section>

        <Section id="verify" title="Verifying a verdict">
          <P>
            The verdict hash is written when the price is set, so the reasoning behind a number
            cannot be quietly rewritten afterwards. Canonicalisation is deliberately boring so
            anyone can reproduce it: object keys sorted at every level by UTF-16 code unit,
            array order preserved, no whitespace, UTF-8, then keccak256.
          </P>
          <Code>{`{"b":2,"a":[3,1],"c":{"z":null,"y":"x"}}      input
{"a":[3,1],"b":2,"c":{"y":"x","z":null}}      canonical
0xfae1d27fb04ddc38b3fceaff82ae580c519ea35b662e979b6f6605a68a77a75a`}</Code>
          <P>
            To check a real one, ask this site to price a sample, keep the reasoning it returns,
            and re-derive the hash with the repo&rsquo;s verify command:
          </P>
          <Code>{`curl -s -X POST -H 'content-type: application/json' \\
  -d '{"sampleId":"contentious"}' \\
  https://tenor-ph5c.onrender.com/api/price > verdict.json

npm run verify -- reasoning.json <the verdictHash from verdict.json>`}</Code>
          <P>
            A mismatch exits non-zero. That is the whole integrity claim, and it does not
            require trusting us.
          </P>
        </Section>

        <Section id="trust" title="Who can do what">
          <Dl
            items={[
              [
                "Anyone",
                "Can mint a receivable against a document they hold, and can fund one that has been priced.",
              ],
              [
                "The underwriting service",
                "Records the verdict, and marks a receivable repaid or defaulted. Pricing is deliberately not a holder action: a freelancer must not be able to underwrite their own paper.",
              ],
            ]}
          />
          <P>
            A verdict can be recorded once per receivable and only before funding, and status
            moves forward only. The contract rejects an advance above face value, a confidence
            above 100, a due date in the past, and a funding amount that does not match the
            priced value.
          </P>
        </Section>

        <Section id="limits" title="What this is not">
          <Callout>
            Tenor is a prototype and a technical demonstration built for the X Layer AI Season
            hackathon. It is not a live financial product, it does not accept money from real
            users, and every document, company and figure in the demo is invented. Nothing here
            is financial advice or an offer of credit.
          </Callout>
          <Dl
            items={[
              [
                "Settlement",
                "Marking a receivable repaid or defaulted is an attestation of status. No money moves back to a funder.",
              ],
              [
                "Units",
                "The priced value is denominated in minor units of the invoice currency but funded in the native gas token. There is no price oracle, so a demo funding costs a negligible amount.",
              ],
              [
                "Scanned documents",
                "A PDF with a text layer is read directly. Photographs and scans need a vision model, which is not configured yet, and are rejected with an explanation rather than a hollow extraction.",
              ],
            ]}
          />
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{marginTop: 64, scrollMarginTop: 24, maxWidth: 760, display: "grid", gap: 18}}
    >
      <h2 style={{fontSize: "clamp(24px, 3.2vw, 34px)"}}>{title}</h2>
      {children}
    </section>
  );
}

function P({children}: {children: React.ReactNode}) {
  return <p style={{fontSize: 17, lineHeight: 1.65, color: "var(--ink-60)"}}>{children}</p>;
}

function Dl({items}: {items: readonly (readonly [string, string])[]}) {
  return (
    <dl style={{display: "grid", gap: 0, margin: 0}}>
      {items.map(([term, body], index) => (
        <div
          key={term}
          style={{
            padding: "16px 0",
            borderTop: index === 0 ? "1px solid var(--line)" : "1px solid var(--line)",
          }}
        >
          <dt style={{fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 4}}>{term}</dt>
          <dd style={{margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-60)"}}>
            {body}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Table({rows}: {rows: readonly (readonly [string, string])[]}) {
  return (
    <div style={{border: "1px solid var(--line)", borderRadius: "var(--radius)"}}>
      {rows.map(([field, meaning], index) => (
        <div
          key={field}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(120px, 160px) 1fr",
            gap: 16,
            padding: "12px 16px",
            borderTop: index === 0 ? undefined : "1px solid var(--line)",
          }}
        >
          <code className="mono" style={{fontSize: 13, color: "var(--green-deep)"}}>
            {field}
          </code>
          <span style={{fontSize: 15, color: "var(--ink-60)"}}>{meaning}</span>
        </div>
      ))}
    </div>
  );
}

function Code({children}: {children: string}) {
  return (
    <pre
      className="mono"
      style={{
        margin: 0,
        padding: "16px 18px",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        fontSize: 13,
        lineHeight: 1.7,
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      {children}
    </pre>
  );
}

function Callout({children}: {children: React.ReactNode}) {
  return (
    <p
      style={{
        padding: "16px 18px",
        background: "var(--green-wash)",
        border: "1px solid var(--green-line)",
        borderRadius: "var(--radius)",
        fontSize: 16,
        lineHeight: 1.6,
      }}
    >
      {children}
    </p>
  );
}
