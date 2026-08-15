#!/usr/bin/env bash
# Deploy UptimeReceivables to X Layer testnet.
#
#   bash scripts/deploy-testnet.sh
#
# Your private key goes into cast's own interactive prompt and is stored in an encrypted
# Foundry keystore. It is never passed as an argument, never written to a file in this
# repo, and never appears in shell history or in this script's output.
set -euo pipefail

RPC="https://testrpc.xlayer.tech"
CHAIN_ID=1952
ACCOUNT="${UPTIME_ACCOUNT:-uptime-deployer}"

cd "$(dirname "$0")/.."

if ! command -v forge >/dev/null 2>&1; then
  export PATH="$HOME/.foundry/bin:$PATH"
fi
command -v forge >/dev/null 2>&1 || {
  echo "forge not found. Install Foundry, then re-run." >&2
  exit 1
}

echo
echo "  Deploying UptimeReceivables to X Layer testnet (chain $CHAIN_ID)"
echo

# 1. Keystore. Skipped entirely if this account already exists.
# cast prints "name (Local)", so match the leading field rather than the whole line.
if cast wallet list 2>/dev/null | grep -q "^${ACCOUNT}\([[:space:]]\|$\)"; then
  echo "  Using existing keystore '$ACCOUNT'."
else
  echo "  No keystore called '$ACCOUNT' yet."
  echo "  Paste the deployer private key at the prompt, then choose a password."
  echo "  Nothing you type is echoed or logged."
  echo
  cast wallet import "$ACCOUNT" --interactive
fi

ADDRESS="$(cast wallet address --account "$ACCOUNT")"
echo
echo "  Deployer: $ADDRESS"

# 2. Refuse to start a deploy that cannot pay for itself.
BALANCE="$(cast balance "$ADDRESS" --rpc-url "$RPC")"
echo "  Balance:  $(cast from-wei "$BALANCE") OKB"
if [ "$BALANCE" = "0" ]; then
  echo
  echo "  That wallet has no testnet OKB. Claim some at" >&2
  echo "  https://web3.okx.com/xlayer/faucet then re-run." >&2
  exit 1
fi

# 3. Deploy. --broadcast is what makes this real rather than a simulation.
echo
echo "  Broadcasting..."
echo
( cd contracts && forge script script/Deploy.s.sol:Deploy \
    --rpc-url "$RPC" \
    --account "$ACCOUNT" \
    --broadcast )

# 4. Pull the address out of the broadcast record rather than scraping stdout.
RECORD="contracts/broadcast/Deploy.s.sol/$CHAIN_ID/run-latest.json"
if [ -f "$RECORD" ]; then
  DEPLOYED="$(node -e "
    const r = require('./$RECORD');
    const tx = r.transactions.find(t => t.transactionType === 'CREATE');
    process.stdout.write(tx ? tx.contractAddress : '');
  ")"
else
  DEPLOYED=""
fi

echo
if [ -n "$DEPLOYED" ]; then
  echo "  Deployed: $DEPLOYED"
  echo "  Explorer: https://www.oklink.com/x-layer-testnet/address/$DEPLOYED"
  echo
  echo "  Next:"
  echo "    1. Send that address to Claude to wire up and record in the README."
  echo "    2. On Render set NEXT_PUBLIC_CONTRACT_ADDRESS=$DEPLOYED"
  echo "       (this triggers a rebuild, not just a restart)"
  echo "    3. On Render set DEPLOYER_PRIVATE_KEY to this wallet's key, so the service"
  echo "       can call recordVerdict, which is onlyOwner."
else
  echo "  Deploy finished but no CREATE transaction was found in the broadcast record."
  echo "  Check the output above."
fi
echo
