# X posting plan

The hackathon rules require a dedicated project X account that stays **active over the
project's lifetime**, and a submission post that mentions **@XLayerOfficial**. Failing
either makes the entry ineligible.

The account has to be created by hand — that is not something an agent can or should do for
you. Once it exists, these are ready to post. Nothing here is aspirational: every number is
from a real run and every claim is one the repo can back up.

Rules of thumb for all of them: no rocket emoji, no "excited to announce", no promising
returns. This is a prototype and the posts should sound like someone building one.

---

## 1. The problem (post first, today)

> A freelancer invoices $3,000 on 60 day terms and waits two months to be paid for work
> they already delivered.
>
> Invoice financing exists, but nobody will manually underwrite $3,000 — the assessment
> costs more than the fee.
>
> Building Tenor to see if AI changes that arithmetic.

## 2. The contract

Post once the testnet address exists. Include the OKLink link.

> Contract is up on X Layer testnet. 24 tests green.
>
> It stores commitments only — a hash of the document, a hash of the agents' reasoning, the
> priced values, and a forward-only status. No inference on chain.
>
> Pricing is deliberately not a holder action: you cannot underwrite your own paper.
>
> <explorer link>

## 3. The disagreement (the important one)

This is the post that explains the idea. Pair it with a screenshot of the debate view.

> Two agents, opposite incentives, same invoice. $18,500, strong contract, payer that can't
> be verified.
>
> Bull: 92%. Work delivered, tests passing at handover, penalty clause.
> Bear: 65%. Payer incorporated 8 months ago, no filed accounts, no reachable site.
> Arbiter: 72%.
>
> 27 points apart. That gap is the product.

## 4. Why they actually disagree

> The failure mode of a two-agent debate is that both agents agree. LLMs are agreeable.
>
> The fix isn't a stronger prompt telling them to argue. It's asymmetric information: the
> bear gets a risk checklist, the bull never sees it.
>
> There is no code path that shows it to the bull.

## 5. A bug worth showing

Build-in-public posts land better when they show something going wrong.

> Spent an hour on a bug where every uploaded document hashed to the same value.
>
> It was keccak256 of an empty input. pdf.js transfers the ArrayBuffer to its worker, which
> detaches the array you handed it — so hashing after parsing hashes nothing.
>
> Hash first, or hand the parser a copy.

## 6. The one that nearly shipped wrong

> Our clean invoice and our deliberately sketchy one both priced at 72%. Suspicious.
>
> The bear's checklist asks about prior payment history. The extraction schema had nowhere
> to put it. So every payer looked unverifiable and the debate couldn't tell them apart.
>
> Added the field. Clean went 72% → 93%.

## 7. Mainnet

> Tenor is on X Layer mainnet. <address> — verified on OKLink.
>
> <explorer link>

## 8. Submission — MUST mention @XLayerOfficial

This is the one the rules require. Do not skip the mention, and post it before the deadline
of 21 August 2026, 23:59 UTC.

> Submitting Tenor to @XLayerOfficial AI Season, AI-RWA track.
>
> Upload an unpaid invoice. Two AI agents with opposing incentives argue about what it is
> worth today. A third decides, and a hash of the reasoning goes on chain so the rationale
> can't be quietly rewritten later.
>
> <demo video, under 3 minutes>
> <live link> <repo link>

---

## Cadence

Roughly one post every day or two until the deadline. Real progress beats volume: an
account with six specific posts about actual problems reads better than one with twenty
promotional ones.
