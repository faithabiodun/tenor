# Tenor: adversarial underwriting for freelancer receivables

Tenor prices an unpaid invoice by making two AI agents argue about it. One represents the
freelancer and argues for the highest defensible advance. One is the capital provider who
would be holding the asset if it went bad. A third weighs both, sets a rate, and a hash of
the full reasoning is written to X Layer so the argument behind the number cannot be
quietly rewritten later.

Built for the X Layer **AI Season** hackathon, **AI-RWA** track.

- **Live:** https://tenor-ph5c.onrender.com
- **Contract (X Layer testnet):** [`0xE0a24398…4b00`](https://www.oklink.com/x-layer-testnet/address/0xE0a24398Ba9A70a3B930B2dd2A69E4F8eda44b00) — verified
- **Contract (X Layer mainnet):** pending

> Built for a hackathon. Tenor does not accept money from real users, and every document,
> company and figure here is fictional. Nothing in this repository is financial advice or an
> offer of credit.

## The problem

A freelancer finishes a job, invoices for $3,000 on 60 day terms, and waits two months to be
paid for work already delivered. Invoice financing exists, but a lender assessing a $3,000
receivable spends more on the assessment than it earns in fees. So nobody does it, and small
receivables go unfinanced.

Automated underwriting changes that arithmetic. That is the whole pitch.

## What Tenor does

- **Reads the document.** Upload a signed contract or an unpaid invoice as a PDF. The fields
  are extracted and shown to you to correct before anything is priced. You stay in charge of
  the inputs; the agents only do the judgement.
- **Argues about it.** Two agents with opposing interests assess the same receivable in
  parallel, then an arbiter sets an advance rate between 50 and 95 with a confidence score
  and a plain-language rationale.
- **Tells you what would raise it.** The arbiter returns up to three specific changes and
  what each is worth: get the outstanding milestone signed off, obtain the payer's
  registration number, add a late payment clause.
- **Commits the reasoning.** The receivable is minted as an ERC-721 and the verdict is
  recorded on chain: a hash of the document, a hash of the reasoning, the priced values and
  a forward-only status.
- **Hands you the evidence.** Every assessment downloads as a file containing the reasoning,
  the exact bytes that were hashed, and the steps to re-derive the hash yourself.

It works the same for creators. A sponsorship invoice is structurally identical to a
freelance one, and the risks that matter — payment gated on brand approval, a takedown right,
net 90 terms — are the same risks under different names.

## Why two agents rather than one

A single model asked to price an asset anchors on the face value, shaves off a
plausible-sounding percentage, and returns a confident number with nothing behind it.

The failure mode of a two-agent debate is that both agents agree, because models are
agreeable. The fix is not a stronger instruction to argue. It is **asymmetric information**:
the capital provider is given a risk checklist and the freelancer's advocate never sees it.
There is no code path that shows it to the other side.

`npm run spread` fails the build on two conditions — if the debaters land within 5 points on
the contentious sample, and if the advocate ever proposes a *lower* rate than the capital
provider, which would mean it argued against its own client.

## What goes on chain

Inference happens off chain. The contract stores commitments only.

| Field | Meaning |
| --- | --- |
| `docHash` | `keccak256` of the uploaded document bytes |
| `verdictHash` | `keccak256` of the canonical reasoning JSON |
| `faceValue` | what the client owes, in minor units |
| `advanceValue` | the agent-priced value today, in minor units |
| `dueDate`, `confidence`, `status` | terms and lifecycle |

The document itself is never published — only its hash, which is enough to tie a price to
exactly those bytes without revealing what they say.

`recordVerdict` is `onlyOwner`. Pricing is deliberately not something a holder can do to
their own paper.

## Verifying a verdict

Canonicalisation is deliberately boring so anyone can reproduce it: object keys sorted at
every level by UTF-16 code unit, array order preserved, no whitespace, UTF-8, then
`keccak256`.

```
$ npm run verify

  input      {"b":2,"a":[3,1],"c":{"z":null,"y":"x"}}
  canonical  {"a":[3,1],"b":2,"c":{"y":"x","z":null}}
  keccak256  0xfae1d27fb04ddc38b3fceaff82ae580c519ea35b662e979b6f6605a68a77a75a
```

To check a real one, ask the live site to price a sample and re-derive the hash it returns:

```bash
curl -s -X POST -H 'content-type: application/json' \
  -d '{"sampleId":"contentious"}' \
  https://tenor-ph5c.onrender.com/api/price > verdict.json

npm run verify -- reasoning.json <the verdictHash from verdict.json>
```

`GET /api/verdict/<hash>` does the same server side and reports whether the stored reasoning
still hashes to the value it claims. A mismatch is a 500, not a quiet `false`.

## Architecture

```
Upload a contract or invoice (PDF)
            |
     Extraction agent          text layer parsed locally, only text sent to the model
            |
   document_quality < 40  ->  rejected, ask for a better copy
            |
      +-----+-----+
  The case    The case         run in parallel; only one of them sees the risk checklist
   for         against
      +-----+-----+
            |
        Arbiter                 rate, confidence, rationale, what would raise it
            |
  Reasoning stored, hash committed
            |
  ERC-721 minted, verdict recorded on X Layer
```

## The agent panel

| Agent | Model |
| --- | --- |
| Extraction | `deepseek-v4-pro` on the text layer; `claude-haiku-4-5` for scans |
| The case for | `deepseek-v4-pro` |
| The case against | `deepseek-v4-pro` |
| Arbiter | `deepseek-v4-pro` |

The debaters run warm so they do not collapse onto the same number. The arbiter runs cold, so
the same debate produces the same verdict — disagreement should come from the debaters, not
from sampling noise in the judge.

A PDF with a text layer never needs vision: the text is parsed locally and only the text is
sent to a model, which is cheaper and more faithful than asking one to read pixels. Scans and
photographs are rejected with an explanation rather than a hollow extraction.

## Running it

Requires [Foundry](https://getfoundry.sh) and Node 22+.

```bash
git clone --recursive https://github.com/faithabiodun/tenor
cd tenor && npm install
cp .env.example .env          # fill in DEEPSEEK_API_KEY

npm run samples               # render the sample invoices
npm run price -- contentious  # run one debate in the terminal
npm run spread -- --all       # the assertion suite
npm run dev --workspace web   # the app on :3000

cd contracts && forge test    # 24 contract tests
```

## Repository

```
contracts/    Foundry project: TenorReceivables.sol, tests, deploy script, flattened source
agents/       Extraction, the two debaters, the arbiter, canonicalisation, sample generation
samples/      Five synthetic receivables as PDFs. Every name and figure is fictional.
web/          Next.js app. The agents run in its route handlers, so model credentials stay
              server side and nobody can drive them directly.
docs/         Runbook and posting plan
```

## Chain details

X Layer testnet is **1952**, confirmed with `eth_chainId` against the live RPC rather than
taken from a chain list — most lists still advertise 195, which is the retired Polygon CDK
zkEVM testnet. Mainnet is **196**. Contracts compile with solc `0.8.24+commit.e11b9ed9`,
optimizer on at 200 runs, EVM version `paris`.

## Licence

MIT.
