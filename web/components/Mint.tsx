"use client";

import {useState} from "react";
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  decodeEventLog,
  http,
} from "viem";
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

  // The contract requires dueDate > block.timestamp. Catch that here rather than letting
  // someone sign a transaction that cannot succeed.
  const dueInFuture =
    extraction.due_date !== null &&
    new Date(`${extraction.due_date}T00:00:00Z`).getTime() > Date.now();

  const canMint =
    contractDeployed &&
    Boolean(docHash) &&
    extraction.amount !== null &&
    extraction.amount > 0 &&
    dueInFuture;

  async function mint() {
    if (!canMint || !CONTRACT_ADDRESS || !docHash) return;
    const client = wallet.client();
    if (!client) return;

    setStage("minting");
    setProblem("");

    try {
      const publicClient = createPublicClient({chain: activeChain, transport: http()});

      const args = [
        docHash as `0x${string}`,
        toMinorUnits(extraction.amount!),
        toUnixSeconds(extraction.due_date!),
      ] as const;

      // Simulate first. A revert here costs nothing and can be explained in English; the
      // same revert after signing costs gas and surfaces as a hex blob in the wallet.
      await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: TENOR_ABI,
        functionName: "mintReceivable",
        args,
        account: client.account!.address,
      });

      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        abi: TENOR_ABI,
        functionName: "mintReceivable",
        args,
        chain: activeChain,
        account: client.account!,
      });
      setMintTx(hash);

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
      setProblem(explain(error));
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

      {docHash && extraction.due_date !== null && !dueInFuture && (
        <Note>
          This invoice fell due on {extraction.due_date}. Tenor advances against money you are
          still waiting for, so there is nothing left to price against and the contract will
          not accept it.
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

/**
 * The contract reverts with custom errors, which reach the browser as four bytes of
 * selector. Every one of these is a condition a person can act on, so say which.
 */
const REVERTS: Record<string, string> = {
  DueDateInPast:
    "This invoice is already due, or falls due today. Tenor prices money you are still " +
    "waiting for, so there is nothing left to advance against.",
  EmptyDocHash: "The document hash is missing, so there is nothing to commit to on chain.",
  ZeroAmount: "The face value is zero. Correct the amount and price it again.",
  AdvanceExceedsFace: "The advance came out above the face value, which the contract rejects.",
  InvalidConfidence: "The confidence score is out of range.",
  VerdictAlreadyRecorded: "A verdict has already been recorded against this receivable.",
  VerdictNotRecorded: "No verdict has been recorded against this receivable yet.",
  IllegalStatusTransition: "This receivable has already moved past the point where that is allowed.",
  IncorrectFundingAmount: "The amount sent does not match the advance that was priced.",
  TransferFailed: "The transfer to the freelancer failed.",
  OwnableUnauthorizedAccount:
    "That call is restricted to the underwriting service, which is deliberate: a holder " +
    "must not be able to price their own paper.",
};

function explain(error: unknown): string {
  // A wallet rejection is a decision, not a failure, so it gets no error banner.
  const raw = error instanceof Error ? error.message : String(error);
  if (/user rejected|user denied|rejected the request/i.test(raw)) return "";

  if (error instanceof BaseError) {
    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      if (name && REVERTS[name]) return REVERTS[name];
      if (name) return `The contract rejected this: ${name}.`;
    }
    if (/insufficient funds/i.test(raw)) {
      return "That wallet has no OKB for gas. Claim some at the X Layer faucet and retry.";
    }
    return error.shortMessage || raw;
  }

  return raw;
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
