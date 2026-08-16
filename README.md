# Uptime: sell the earnings your machine has not made yet

Uptime prices the future revenue of an infrastructure node by making two AI agents argue
about it. One represents the operator and argues for the highest price the record supports.
One is the investor who ends up holding the shares if the node goes dark. A third weighs
both, sets a price per share, and a hash of the full reasoning is written to X Layer so the
argument behind the number cannot be quietly rewritten afterwards.

Built for the X Layer AI Season hackathon, AI-RWA track.

---

## The problem

Someone runs a machine that earns small amounts continuously — a bandwidth node, a GPU
renting out compute, a wireless hotspot. It might make twelve dollars a month. Reliable,
but slow, and far too small for any lender to look at.

So the operator waits. Meanwhile the thing has an obvious value: it *has* been earning,
verifiably, and will probably keep earning. That is an asset. It is just not one anybody
knows how to price.

## What it does

1. **Reads what the node earned.** Point Uptime at the address a node is paid to. It reads
   the transfers straight from the chain and derives every figure by arithmetic — monthly
   totals, volatility, longest gap, trend. No one is asked to be believed.
2. **Runs a panel.** Two agents with opposing incentives argue over what fraction of
   projected term earnings a buyer should pay today. A third decides.
3. **Tokenises the result.** The operator lists the node and holds every share. Buyers take
   shares at the priced rate. Revenue delivered to the vault becomes claimable pro rata.

## Why the debate is real

Give two language models the same task and the same information and they reach the same
answer nearly every time. You get something debate-shaped with no disagreement inside it.

So they are not given the same information. **The investor works from a risk checklist. The
operator's advocate never sees it, and is never told it exists.** The disagreement is
structural rather than instructed.

Two sample nodes, same code, same day:

| Node | Score | Operator | Investor | Verdict |
| --- | --- | --- | --- | --- |
| Steady, 124 days on chain | 84 | 92% | 50% | **62%** |
| Decaying rewards, hidden outage, thin margin | 55 | 74% | 10% | **30%** |

The investor led with the hole nobody scripted for it:

> Net margin is thin and shrinking: net_monthly of 8.46 against operating_cost_monthly of
> 5.20; another ~38% drop in gross revenue makes the node unprofitable, and the operator has
> no obligation to keep it running once paid.

That is the real weakness in this entire idea, and the system says it out loud, in the
product, to the person about to hand over money.

## The chain is the oracle

Tokenise a building or an invoice and you need someone trustworthy to swear the real thing
did what it claimed. That person is the weak link, and every RWA project has one.

A node's earnings are already an on-chain event. We do not ask the operator what they made,
we read it, and anyone can repeat the query and get the same answer.

`UptimeVault` stores commitments only:

| | |
| --- | --- |
| `sourceHash` | keccak256 of the canonical earnings history the agents read |
| `verdictHash` | keccak256 of the canonical reasoning JSON |
| `recordValuation` | `onlyOwner` — an operator must not price their own node |

Shares are ERC-1155, one token id per node. Revenue splits through a cumulative
`accRevenuePerShare` accumulator with reward debt settled on both sides of every balance
change, so shares can change hands between payouts without anyone gaining or losing revenue
they did not hold shares for. After every party claims, the vault holds exactly zero.

## What is honest about this, and what is not

- The contract and its accounting are real, and tested. `forge test` — 27 passing, including
  the mid-stream transfer case and a full-drain solvency check.
- The panel is real. The rates in the table above are live model output, not written by hand.
- **The sample nodes are fixtures.** Their earnings histories are generated from a seeded
  sequence so hashes stay reproducible. They are labelled as fixtures in the source and on
  the site. They are not a real machine.
- The quality gate refuses to price a node with too little history, and that refusal is a
  feature. A number drawn from eleven days looks exactly as confident as one drawn from a
  year, which is precisely why it is not produced.

## Layout

```
contracts/   UptimeVault.sol, tests, deploy script     (Foundry, Solidity 0.8.24)
agents/      revenue reader, panel, prompts, fixtures  (TypeScript, DeepSeek)
web/         the site and the valuation bay            (Next.js 16, viem)
```

The integrity core is `agents/src/canonical.ts`: keys sorted at every level by UTF-16 code
unit, array order preserved, no whitespace, UTF-8, then keccak256. Deliberately boring so a
third party can reproduce it.

## Running it

```bash
npm install
cp .env.example .env          # DEEPSEEK_API_KEY, then the chain vars

npm run price:node -w @uptime/agents -- steady     # run the panel on a fixture
npm run price:node -w @uptime/agents -- thin       # watch the quality gate refuse
npm run dev -w @uptime/web                         # the site

cd contracts && forge test                         # 27 tests
```

## Deployment

| | | |
| --- | --- | --- |
| X Layer testnet | chain 1952 | [`0x164cbf80…20feb52`](https://www.oklink.com/x-layer-testnet/address/0x164cbf8067229a3b699840630b9b3cb6020feb52) |
| X Layer mainnet | chain 196 | not yet deployed |

The owner of the deployed vault is the account that runs the panel. `recordValuation` is
restricted to it, because an operator pricing their own node is the failure the whole design
exists to prevent.

Chain ids were confirmed by calling `eth_chainId` directly. Published chain lists disagree
with each other about X Layer testnet, and most of them are wrong.

---

Uptime does not take money from real users. Nothing here is financial advice or an offer of
credit.
