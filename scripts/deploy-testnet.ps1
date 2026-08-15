# Deploy UptimeReceivables to X Layer testnet, from PowerShell.
#
#   .\scripts\deploy-testnet.ps1
#
# Your private key goes into cast's own interactive prompt and is stored in an encrypted
# Foundry keystore. It is never passed as an argument, never written into this repo, and
# never appears in PowerShell history or in this script's output.
#
# Written for Windows PowerShell 5.1, so no &&, no ternaries, no null-coalescing.

$ErrorActionPreference = "Stop"

$Rpc = "https://testrpc.xlayer.tech"
$ChainId = 1952
$Account = $env:UPTIME_ACCOUNT
if (-not $Account) { $Account = "uptime-deployer" }

# Repo root is the parent of this script's directory.
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Get-Command forge -ErrorAction SilentlyContinue)) {
    $FoundryBin = Join-Path $env:USERPROFILE ".foundry\bin"
    if (Test-Path $FoundryBin) { $env:Path = "$env:Path;$FoundryBin" }
}
if (-not (Get-Command forge -ErrorAction SilentlyContinue)) {
    Write-Error "forge not found. Install Foundry, open a new terminal, then re-run."
    exit 1
}

Write-Host ""
Write-Host "  Deploying UptimeReceivables to X Layer testnet (chain $ChainId)"
Write-Host ""

# 1. Keystore. Skipped entirely when this account already exists.
#    cast prints "name (Local)", so match the leading field rather than the whole line.
$Existing = @(cast wallet list 2>$null | Where-Object { $_ -match "^$([regex]::Escape($Account))(\s|$)" })
if ($Existing.Count -gt 0) {
    Write-Host "  Using existing keystore '$Account'."
} else {
    Write-Host "  No keystore called '$Account' yet."
    Write-Host "  Paste the deployer private key at the prompt, then choose a password."
    Write-Host "  Nothing you type is echoed or logged."
    Write-Host ""
    cast wallet import $Account --interactive
}

$Address = (cast wallet address --account $Account).Trim()
Write-Host ""
Write-Host "  Deployer: $Address"

# 2. Refuse to start a deploy that cannot pay for itself.
$Balance = (cast balance $Address --rpc-url $Rpc).Trim()
$Okb = (cast from-wei $Balance).Trim()
Write-Host "  Balance:  $Okb OKB"
if ($Balance -eq "0") {
    Write-Host ""
    Write-Error "That wallet has no testnet OKB. Claim some at https://web3.okx.com/xlayer/faucet then re-run."
    exit 1
}

# 3. Deploy. --broadcast is what makes this real rather than a simulation.
Write-Host ""
Write-Host "  Broadcasting..."
Write-Host ""
Push-Location (Join-Path $Root "contracts")
try {
    forge script script/Deploy.s.sol:Deploy --rpc-url $Rpc --account $Account --broadcast
} finally {
    Pop-Location
}

# 4. Read the address out of the broadcast record rather than scraping stdout.
$Record = Join-Path $Root "contracts\broadcast\Deploy.s.sol\$ChainId\run-latest.json"
$Deployed = ""
if (Test-Path $Record) {
    $Run = Get-Content $Record -Raw | ConvertFrom-Json
    $Create = $Run.transactions | Where-Object { $_.transactionType -eq "CREATE" } | Select-Object -First 1
    if ($Create) { $Deployed = $Create.contractAddress }
}

Write-Host ""
if ($Deployed) {
    Write-Host "  Deployed: $Deployed"
    Write-Host "  Explorer: https://www.oklink.com/x-layer-testnet/address/$Deployed"
    Write-Host ""
    Write-Host "  Next:"
    Write-Host "    1. Send that address to Claude to wire up and record in the README."
    Write-Host "    2. On Render set NEXT_PUBLIC_CONTRACT_ADDRESS=$Deployed"
    Write-Host "       (this triggers a rebuild, not just a restart)"
    Write-Host "    3. On Render set DEPLOYER_PRIVATE_KEY to this wallet's key, so the"
    Write-Host "       service can call recordVerdict, which is onlyOwner."
} else {
    Write-Host "  Deploy finished but no CREATE transaction was found in the broadcast record."
    Write-Host "  Check the output above."
}
Write-Host ""
