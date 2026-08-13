# Tenor

**Adversarial underwriting for freelancer receivables.** Upload a signed contract or
an unpaid invoice. Two AI agents with opposing incentives argue about what it is worth
today. A third arbitrates, sets an advance rate, and the verdict plus a hash of its
reasoning is written to X Layer alongside the tokenised receivable.

Built for the X Layer **AI Season** hackathon, **AI-RWA** track.

**Live: https://tenor-production-a11b.up.railway.app**

A debate is three sequential model calls and takes about forty-five seconds. It is real
every time, and nothing is cached.

> **Built for the X Layer AI Season hackathon.** It does not accept real money from real
> users, and every document and company in this repository is fictional. Nothing here is
> financial advice or an offer of credit.

## Contracts

| Network | Chain ID | Address | Explorer |
| --- | --- | --- | --- |
| X Layer Testnet | 1952 | `0xE0a24398Ba9A70a3B930B2dd2A69E4F8eda44b00` | [OKLink](https://www.oklink.com/x-layer-testnet/address/0xE0a24398Ba9A70a3B930B2dd2A69E4F8eda44b00) |
| X Layer Mainnet | 196 | _pending_ | — |

Verified on chain: `name()` returns `Tenor Receivable`, `symbol()` returns `TENOR`, and
`owner()` is the deploying wallet, which is the underwriting service that records verdicts.

Chain IDs were confirmed with `eth_chainId` against the live RPCs, not taken from a
chain list. Most chain lists still show X Layer testnet as **195**; that is the retired
Polygon CDK zkEVM testnet. X Layer moved to an enhanced OP Stack in the August 2025
"PP upgrade" and the current testnet answers on **1952**.

```
$ curl -s -X POST -H 'Content-Type: application/json' \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    https://testrpc.xlayer.tech
{"jsonrpc":"2.0","result":"0x7a0","id":1}     # 1952
```

## The problem

A freelancer finishes a job, invoices for $3,000 on 60 day terms, and waits. Invoice
financing exists, but no underwriter will manually assess a $3,000 receivable, because
the assessment costs more than the fee. So small receivables go unfinanced and
freelancers absorb the wait.

Automated underwriting changes those economics.

## Why adversarial

A single LLM asked to price an asset is confidently wrong. It anchors on the face
value, shaves off a plausible-sounding percentage, and produces a number with no
stress-testing behind it.

Two agents with opposing incentives surface what one pass misses: the payer has no
verifiable history, the due date is 90 days out, the termination clause is broad, the
deliverables are ambiguous. The arbiter weighs both and produces a number with a
defensible trail.

The agents are kept apart by **asymmetric information**, not by instructions telling
them to disagree. The bear sees a risk checklist; the bull never does. That structural
difference is what produces real disagreement instead of two models politely
converging.

**The reasoning trail is the product, not just the number.**

## What goes on chain

Inference stays off chain. The contract stores commitments only.

| Field | Meaning |
| --- | --- |
| `docHash` | `keccak256` of the uploaded document bytes |
| `verdictHash` | `keccak256` of the canonical reasoning JSON |
| `faceValue` | what the client owes, in minor units |
| `advanceValue` | agent-priced value today, in minor units |
| `dueDate`, `confidence`, `status` | terms and lifecycle |

Because the verdict hash is written at pricing time, the rationale cannot be quietly
rewritten afterwards. Anyone can re-derive it from the stored reasoning JSON.

### Verifying a verdict hash

Canonicalisation is deliberately boring so it is reproducible: the reasoning object is
serialised as JSON with **keys sorted lexicographically at every level** (by UTF-16 code
unit, not locale), **array order preserved**, **no whitespace**, and UTF-8 encoding, then
hashed with `keccak256` over the resulting bytes.

```
$ npm run verify

  input      {"b":2,"a":[3,1],"c":{"z":null,"y":"x"}}
  canonical  {"a":[3,1],"b":2,"c":{"y":"x","z":null}}
  keccak256  0xfae1d27fb04ddc38b3fceaff82ae580c519ea35b662e979b6f6605a68a77a75a
```

To check a real verdict, read `verdictHash` off the contract, fetch the stored reasoning
JSON, and re-derive it:

```bash
npm run verify -- reasoning.json 0x8f3a...
```

A mismatch exits non-zero. That is the whole integrity claim, and it does not require
trusting us.

## Architecture

```
Freelancer uploads contract or invoice (PDF / image)
                |
        Extraction agent  (cheap model, strict JSON)
                |
        document_quality < 40  ->  reject, ask for a better scan
                |
          +-----+-----+
     Bull agent   Bear agent      run in parallel
          +-----+-----+
                |
          Arbiter agent  (advance rate, confidence, rationale)
                |
   Store full reasoning JSON in Supabase
   Write docHash + verdictHash + rate on X Layer
                |
      Mint ERC-721 receivable to the freelancer
```

## The agent panel

| Agent | Model | Why |
| --- | --- | --- |
| Extraction | `claude-haiku-4-5` | Reads the uploaded PDF or photo, so it needs vision |
| Bull | `deepseek-v4-pro` | Text in, text out |
| Bear | `deepseek-v4-pro` | Text in, text out |
| Arbiter | `deepseek-v4-pro` | Text in, text out |

The debate runs on DeepSeek because that is where the cost actually is: bull, bear and
arbiter are re-run dozens of times against the same three documents during prompt tuning.
Extraction is cached to disk by document hash and runs about once per document, so the
vision leg is a rounding error. DeepSeek does not expose image input on its public API,
which is the only reason extraction sits elsewhere.

Bull and bear run at temperature 0.7; the arbiter runs cold, so the same debate produces
the same verdict. Disagreement is supposed to come from the debaters, not from sampling
noise in the judge.

### Behaviour on the three samples

```
  sample        bull  bear  spread  verdict  conf
  clean           96    80      16      88%    72
  messy           70    40      30      55%    45
  contentious     90    60      30      70%    50
```

Rate, confidence and disagreement all order the way they should. `npm run spread` fails
loudly on two conditions: if the debaters land within 5 points on the contentious sample,
because a debate where both sides agree destroys the premise, and if the bull ever comes in
*below* the bear on any sample, because that means the freelancer's own advocate argued
against them.

### Two findings worth knowing about

**The schema could not carry what the bear was asked to weigh.** The risk checklist asks
about prior payment history and whether the payer is a real registered entity, and section
7.1's extraction schema had a field for neither. Every payer therefore read as unverifiable
and the clean and contentious samples both priced at 72%. Adding `payer_history` and
`payer_identifier` moved the clean sample from 72% to 93%.

**The bull once argued against its own client.** On the messy sample it proposed 35% against
the bear's 50%, reasoning in the lender's voice: "reduces the potential loss", "may make
collection efforts more straightforward". An absolute spread could not tell that 15 point
inversion from a healthy 15 point gap, so the check that exists to catch a broken debate
waved through the most broken one. The pipeline now reports `inverted` and the assertion
covers every sample.

## Repository

```
contracts/    Foundry project: TenorReceivables.sol, tests, deploy script
agents/       Extraction, bull, bear, arbiter; canonicalisation; sample generation
samples/      Three synthetic receivables as PDFs. Every name and figure is fictional.
web/          Next.js app. The agent panel runs in its route handlers, so model
              credentials stay server side and nobody can drive the agents directly.
railway.json  Build and deploy config for the single web service.
```

### Verified against the live deployment

The integrity claim is not a local-only property. Ask production to price the contentious
sample, keep the reasoning it returns, and re-derive the hash yourself:

```bash
curl -s -X POST -H 'content-type: application/json' \
  -d '{"sampleId":"contentious"}' \
  https://tenor-production-a11b.up.railway.app/api/price > verdict.json

node -e 'require("fs").writeFileSync("reasoning.json",
  JSON.stringify(JSON.parse(require("fs").readFileSync("verdict.json","utf8")).reasoning))'

npm run verify -- reasoning.json <the verdictHash from verdict.json>
```

Last run: bull 92%, bear 65%, arbiter 72%, 27 points apart, and the hash matched.

## Development

Requires [Foundry](https://getfoundry.sh).

```bash
git clone --recursive <repo>
cd tenor/contracts
forge test
```

If you cloned without `--recursive`:

```bash
git submodule update --init --recursive
```

### Trust model

`recordVerdict`, `markRepaid` and `markDefaulted` are `onlyOwner`. The owner is the
Tenor underwriting service that runs the agent panel. A freelancer holding a receivable
must not be able to price their own paper, so pricing is deliberately not a holder
action. `mintReceivable` and `fund` are open to anyone.

### Known simplifications

- `advanceValue` is denominated in minor units of the invoice currency but `fund` pays
  in wei of the native gas token. There is no price oracle. A demo funding therefore
  costs a negligible amount of OKB. Real settlement is out of scope.
- `markRepaid` and `markDefaulted` are status attestations. No money moves back to the
  funder.

## Licence

MIT.
