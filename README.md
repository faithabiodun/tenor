# Tenor

**Adversarial underwriting for freelancer receivables.** Upload a signed contract or
an unpaid invoice. Two AI agents with opposing incentives argue about what it is worth
today. A third arbitrates, sets an advance rate, and the verdict plus a hash of its
reasoning is written to X Layer alongside the tokenised receivable.

Built for the X Layer **AI Season** hackathon, **AI-RWA** track.

> **This is a prototype and a technical demonstration.** It is not a live financial
> product. It does not accept real money from real users, and every document and
> company in this repository is fictional.

## Contracts

| Network | Chain ID | Address | Explorer |
| --- | --- | --- | --- |
| X Layer Testnet | 1952 | _pending day 2_ | — |
| X Layer Mainnet | 196 | _pending day 7_ | — |

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
serialised as JSON with **keys sorted lexicographically at every level**, **no
whitespace**, and UTF-8 encoding, then hashed with `keccak256` over the resulting
bytes.

_Canonicalisation helper and a worked example land with the agent pipeline on day 3._

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

## Repository

```
contracts/    Foundry project: TenorReceivables.sol, tests, deploy script
```

`agents/`, `web/` and `samples/` land on days 3 to 6.

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

### Known prototype simplifications

- `advanceValue` is denominated in minor units of the invoice currency but `fund` pays
  in wei of the native gas token. There is no price oracle. A demo funding therefore
  costs a negligible amount of OKB. Real settlement is out of scope.
- `markRepaid` and `markDefaulted` are status attestations. No money moves back to the
  funder.

## Licence

MIT.
