"use client";

import {useState} from "react";
import {createPublicClient, decodeEventLog, http} from "viem";
import {TENOR_ABI} from "../lib/abi";
import {
  ACTIVE_CHAIN_ID,
  CONTRACT_ADDRESS,
  activeChain,
  contractDeployed,
  explorerTx,
  toMinorUnits,
  toUnixSeconds,
} from "../lib/chain";
import {useWallet} from "../lib/useWallet";
import type {Verdict} from "../lib/types";

type Stage = "idle" | "minting" | "recording" | "done" | "failed";

/**
 * Put the receivable on chain.
 *
 * Two transactions, deliberately. The freelancer mints from their own wallet, because the
 * token is theirs. The verdict is then written by the underwriting service, because
 * recordVerdict is onlyOwner and letting a holder price their own paper would defeat the
 * point of the whole exercise.
 */
export function Mint({verdict, docHash}: {verdict: Verdict; docHash: string | null}) {
  const wallet = useWallet();
  const [stage, setStage] = useState<Stage>("idle");
  const [mintTx, setMintTx] = useState<string | null>(null);
  const [recordTx, setRecordTx] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [problem, setProblem] = useState("");

  const {extraction, arbiter} = verdict.reasoning;
  const canMint =
    contractDeployed && docHash && extraction.amount !== null && extraction.due_date !== null;

  async function mint() {
    if (!canMint || !CONTRACT_ADDRESS || !docHash) return;
    const client = wallet.client();
    if (!client) return;

    setStage("minting");
    setProblem("");

    try {
      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: TENOR_ABI,
        functionName: "mintReceivable",
        args: [
          docHash as `0x${string}`,
          toMinorUnits(extraction.amount!),
          toUnixSeconds(extraction.due_date!),
        ],
        chain: activeChain,
        account: client.account!,
      });
      setMintTx(hash);

      const publicClient = createPublicClient({chain: activeChain, transport: http()});
      const receipt = await publicClient.waitForTransactionReceipt({hash});

      // The token id is only in the event, not the return value, because a transaction
      // receipt carries logs rather than return data.
      let minted: string | null = null;
      for (const log of receipt.logs) {
        try {
          const parsed = decodeEventLog({abi: TENOR_ABI, data: log.data, topics: log.topics});
          if (parsed.eventName === "ReceivableMinted") {
            minted = String((parsed.args as {tokenId: bigint}).tokenId);
            break;
          }
        } catch {
          // Other contracts' logs land here too; skip anything that is not ours.
        }
      }

      if (!minted) throw new Error("Minted, but no ReceivableMinted event was found.");
      setTokenId(minted);

      setStage("recording");
      const response = await fetch("/api/record-verdict", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({tokenId: minted, verdictHash: verdict.verdictHash}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "The verdict could not be recorded.");

      setRecordTx(data.txHash);
      setStage("done");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      // Wallet rejections are a decision, not a failure.
      setProblem(/user rejected|denied/i.test(message) ? "" : message);
      setStage(mintTx ? "failed" : "idle");
    }
  }

  if (!contractDeployed) {
    return (
      <Panel>
        <p style={{fontSize: 15, color: "var(--ink-60)"}}>
          Minting opens once the contract is deployed to {activeChain.name}. The verdict above
          is already hashed and stored, so it can be written on chain unchanged.
        </p>
      </Panel>
    );
  }

  if (stage === "done") {
    return (
      <Panel>
        <span className="eyebrow">On chain</span>
        <p style={{fontSize: 17, marginTop: 6}}>
          Receivable #{tokenId} minted, and the verdict recorded against it.
        </p>
        <div style={{display: "grid", gap: 8, marginTop: 14}}>
          <TxLink label="Mint" hash={mintTx} />
          <TxLink label="Verdict" hash={recordTx} />
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <span className="eyebrow">Put it on chain</span>
      <p style={{fontSize: 15, color: "var(--ink-60)", margin: "8px 0 16px", maxWidth: "62ch"}}>
        Two transactions. You mint the receivable from your own wallet; the underwriting
        service then writes the verdict against it, because pricing is deliberately not
        something a holder can do to their own paper.
      </p>

      <dl style={{display: "grid", gap: 10, margin: "0 0 18px"}}>
        <Row label="docHash" value={docHash ?? "not available"} />
        <Row label="verdictHash" value={verdict.verdictHash} />
        <Row
          label="faceValue"
          value={
            extraction.amount === null
              ? "unknown"
              : `${toMinorUnits(extraction.amount)} minor units`
          }
        />
        <Row label="advanceRate" value={`${arbiter.advance_rate}%`} />
        <Row label="confidence" value={`${arbiter.confidence}`} />
        <Row label="dueDate" value={extraction.due_date ?? "unknown"} />
      </dl>

      {!docHash && (
        <Note>
          This receivable was priced from a sample rather than an uploaded document, so there
          is no document hash to commit to. Upload a PDF to mint one.
        </Note>
      )}

      {problem && <Note tone="bad">{problem}</Note>}

      {!wallet.available ? (
        <Note>No wallet detected. Install OKX Wallet or MetaMask, then reload this page.</Note>
      ) : !wallet.address ? (
        <Action onClick={wallet.connect} busy={wallet.connecting}>
          {wallet.connecting ? "Check your wallet..." : "Connect wallet"}
        </Action>
      ) : !wallet.onRightChain ? (
        <Action onClick={wallet.switchChain}>Switch to {activeChain.name}</Action>
      ) : (
        <Action onClick={mint} busy={stage !== "idle"} disabled={!canMint}>
          {stage === "minting"
            ? "Minting..."
            : stage === "recording"
              ? "Recording the verdict..."
              : "Mint receivable"}
        </Action>
      )}

      {wallet.address && (
        <p className="mono" style={{fontSize: 12, color: "var(--ink-40)", marginTop: 10}}>
          {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)} · chain {wallet.chainId}
        </p>
      )}

      {/* The done state returns earlier, so reaching here with a mint hash means the mint
          landed but recording the verdict did not. Show it so the token is not lost. */}
      {mintTx && (
        <div style={{marginTop: 12}}>
          <TxLink label="Mint" hash={mintTx} />
        </div>
      )}
    </Panel>
  );
}

function Panel({children}: {children: React.ReactNode}) {
  return (
    <section
      style={{
        marginTop: 24,
        padding: "22px 22px 24px",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        background: "var(--paper)",
      }}
    >
      {children}
    </section>
  );
}

function Row({label, value}: {label: string; value: string}) {
  return (
    <div style={{display: "flex", flexWrap: "wrap", gap: "2px 14px", alignItems: "baseline"}}>
      <dt className="mono" style={{fontSize: 12, color: "var(--green-deep)", minWidth: 108}}>
        {label}
      </dt>
      <dd className="mono" style={{margin: 0, fontSize: 13, color: "var(--ink-60)"}}>
        {value}
      </dd>
    </div>
  );
}

function TxLink({label, hash}: {label: string; hash: string | null}) {
  if (!hash) return null;
  return (
    <a
      href={explorerTx(hash, ACTIVE_CHAIN_ID)}
      target="_blank"
      rel="noopener noreferrer"
      className="mono"
      style={{fontSize: 12, color: "var(--green-deep)"}}
    >
      {label}: {hash.slice(0, 10)}…{hash.slice(-8)} ↗
    </a>
  );
}

function Action({
  children,
  onClick,
  busy = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      style={{
        background: busy || disabled ? "var(--ink-40)" : "var(--green)",
        color: "#fff",
        border: "none",
        borderRadius: 999,
        padding: "13px 26px",
        fontSize: 16,
        fontWeight: 500,
        cursor: busy || disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Note({children, tone = "neutral"}: {children: React.ReactNode; tone?: "neutral" | "bad"}) {
  const bad = tone === "bad";
  return (
    <p
      style={{
        margin: "0 0 14px",
        padding: "11px 14px",
        fontSize: 14,
        borderRadius: "var(--radius-md)",
        border: `1px solid ${bad ? "var(--neg)" : "var(--line)"}`,
        background: bad ? "transparent" : "var(--surface)",
        color: bad ? "var(--neg)" : "var(--ink-60)",
      }}
    >
      {children}
    </p>
  );
}
