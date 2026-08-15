# Uptime runbook

> The ticks in this runbook were earned by the previous contract, which priced invoices and
> has been deleted. `UptimeVault` is a different contract and has not been deployed to either
> network yet, so Phases 1, 3 and 5 all start again from zero.

Everything left to do, in order. Deadline: **21 August 2026, 23:59 UTC**.

Facts you will need throughout:

| Thing | Value |
| --- | --- |
| Repo | https://github.com/faithabiodun/uptime |
| Live site | https://uptime-ph5c.onrender.com (Railway) |
| Deployer wallet | `0xDB6450b96ed49c640bAf8acA782C5ffaE99cA7e8` |
| Foundry keystore | `uptime-deployer` (already imported) |
| X Layer testnet | chain **1952**, RPC `https://testrpc.xlayer.tech` |
| X Layer mainnet | chain **196**, RPC `https://rpc.xlayer.tech` |
| Supabase project | `uptime` — `https://svbqoplujdigkbmwxvib.supabase.co` |
| Compiler settings | solc **0.8.24**, optimizer **on**, **200** runs, EVM **Paris** |

Those compiler settings are not optional. Explorer verification compares bytecode, and any
difference produces a different hash and a failed verification.

---

## Phase 1 — Deploy to testnet

Roughly ten minutes. This is a **pass/fail hackathon requirement**.

### 1.1 Decide which wallet deploys

Whichever wallet signs becomes the contract owner, and that same key goes into Render as
`DEPLOYER_PRIVATE_KEY` so the service can call `recordVerdict`, which is `onlyOwner`.

If `0xDB64…` is also the wallet you want prize money paid to, **use a fresh one instead**:

```bash
cast wallet new
```

Note the address and key, claim faucet OKB to the new address, then import it:

```bash
cast wallet import uptime-deployer-2 --interactive
UPTIME_ACCOUNT=uptime-deployer-2 bash scripts/deploy-testnet.sh
```

If you are happy reusing `0xDB64…`, skip to 1.2.

### 1.2 Deploy

From the `uptime` directory. **PowerShell** (the default Windows terminal):

```powershell
.\scripts\deploy-testnet.ps1
```

Git Bash or WSL:

```bash
bash scripts/deploy-testnet.sh
```

If PowerShell refuses to run the script at all, its execution policy is blocking local
scripts. Either unblock it for this session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

or skip the script and run the two commands it wraps:

```powershell
cd contracts
forge script script/Deploy.s.sol:Deploy --rpc-url https://testrpc.xlayer.tech --account uptime-deployer --broadcast
```

It prompts for the **keystore password**, not the private key. Expect:

```
  Deployer: 0xDB6450b96ed49c640bAf8acA782C5ffaE99cA7e8
  Balance:  0.200000000000000000 OKB
  Broadcasting...
  Deployed: 0x…
  Explorer: https://www.oklink.com/x-layer-testnet/address/0x…
```

**Copy that address.** Everything downstream needs it.

If it fails with `insufficient funds`, claim again at
https://web3.okx.com/xlayer/faucet. A deploy costs about 0.00009 OKB, so 0.2 covers
roughly two thousand of them.

---

## Phase 2 — Configure Render

Ten minutes. Render dashboard → the `uptime` service → **Environment**.

Add or confirm all six:

| Key | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CHAIN_ID` | `1952` | testnet |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | the address from 1.2 | |
| `SUPABASE_URL` | `https://svbqoplujdigkbmwxvib.supabase.co` | |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_dOstlitdBB0idA3B9sr43g_jsnbsCaQ` | not secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → `uptime` → Settings → API → `service_role` | **secret** |
| `DEPLOYER_PRIVATE_KEY` | the key that deployed in 1.2 | **secret** |

Three of these are already in `render.yaml`, but a service created before they were added
does not pick them up automatically. Check each one is actually present in the dashboard
rather than assuming.

**`NEXT_PUBLIC_CONTRACT_ADDRESS` triggers a rebuild, not a restart.** Next inlines
`NEXT_PUBLIC_*` at build time, so without it the entire mint flow is stripped from the
browser bundle. Wait for the deploy to finish before testing.

---

## Phase 3 — Verify the contract on OKLink

Ten minutes. Unverified contracts read as unfinished work to judges.

1. Go to `https://www.oklink.com/x-layer-testnet/address/<your address>`
2. Contract tab → **Verify and Publish**
3. Settings:
   - Compiler type: **Solidity (Single file)**
   - Compiler version: **v0.8.24**
   - Open source licence: **MIT**
   - Optimization: **Yes**, **200** runs
   - EVM version: **paris**
4. Paste the entire contents of `contracts/flattened/UptimeReceivables.flat.sol`
5. Constructor arguments: **leave empty** — there are none
6. Verify. It usually takes 30 to 60 seconds.

If it fails, the cause is almost always a settings mismatch, not the source. Re-check
optimizer runs and EVM version first.

---

## Phase 4 — Test the whole flow end to end

Five minutes, and worth doing carefully because this is what the demo video shows.

1. Open https://uptime-ph5c.onrender.com/price
2. Pick the **contentious** sample, or upload a PDF invoice
3. Check the extracted fields, press **Price this receivable**
4. Wait about 45 seconds for the debate
5. Confirm the verdict panel shows **reasoning stored · verify** rather than
   "reasoning not stored" — if it says not stored, `SUPABASE_SERVICE_ROLE_KEY` is missing
6. Click **verify** and confirm the JSON says `"matches": true`
7. In the mint panel: connect wallet → switch to X Layer Testnet if prompted → **Mint
   receivable**
8. Two transactions should land: your mint, then the service recording the verdict
9. Follow the explorer links and confirm both succeeded

If the mint panel says "Minting opens once the contract is deployed", the address did not
reach the build. Re-check Phase 2 and that the rebuild actually ran.

---

## Phase 5 — Mainnet

Twenty minutes. Also a **pass/fail requirement**.

1. Send OKB to the deployer address **on X Layer**, not Ethereum. About **0.05 OKB**
   (roughly five dollars) is plenty; the deploy itself costs well under a cent, but
   exchange withdrawal minimums are the real constraint.
2. Confirm it arrived:
   ```bash
   cast balance 0xDB6450b96ed49c640bAf8acA782C5ffaE99cA7e8 --rpc-url https://rpc.xlayer.tech
   ```
3. Deploy:
   ```bash
   cd contracts
   forge script script/Deploy.s.sol:Deploy \
     --rpc-url https://rpc.xlayer.tech \
     --account uptime-deployer \
     --broadcast
   ```
4. Verify on OKLink exactly as in Phase 3, but under
   `https://www.oklink.com/x-layer/address/<address>`
5. Decide whether the live site points at mainnet. If yes, set `NEXT_PUBLIC_CHAIN_ID=196`
   and `NEXT_PUBLIC_CONTRACT_ADDRESS` to the mainnet address on Render.

Both addresses go in the README either way. The requirement is that the contract is
deployed and verified on mainnet, not that the demo runs against it.

---

## Phase 6 — The X account

Required by the rules: a dedicated project account, **active over the project's lifetime**,
and a submission post mentioning **@XLayerOfficial**. Missing either makes the entry
ineligible.

Eight drafts are ready in [docs/social.md](social.md), each built on a real run. Suggested
order now that time is short:

1. The problem — post today
2. The contract, with the testnet explorer link — after Phase 1
3. The disagreement, with a screenshot of the debate view — the important one
4. The `pdf.js` hashing bug — build-in-public posts land better when something went wrong
5. Mainnet — after Phase 5
6. The submission post, tagging **@XLayerOfficial**

There is no way to create this history retroactively, so the first post is the one that
matters most today.

---

## Phase 7 — Demo video and submission

**Video, under three minutes.** Show, in this order:

1. The problem, in one sentence
2. Upload the contentious sample
3. The two agents disagreeing — this is the moment the idea lands, so let it breathe
4. The verdict and the spread bar
5. Minting, and the explorer showing the hash on chain
6. The verify endpoint returning `"matches": true`

**Google Form**, before 21 August 23:59 UTC. Have ready:

- Repo link
- Live site link
- Both contract addresses with explorer links
- Demo video link
- The X post mentioning @XLayerOfficial

---

## Order of play

Phases 1 to 4 are one sitting, about half an hour, and they unblock everything else. Phase 6
should start today regardless, because it is the only item that cannot be compressed.
