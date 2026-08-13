import {createPublicClient, createWalletClient, http} from "viem";
import {privateKeyToAccount} from "viem/accounts";
import {TENOR_ABI} from "../../../lib/abi";
import {ACTIVE_CHAIN_ID, CONTRACT_ADDRESS, activeChain, contractDeployed} from "../../../lib/chain";
import {findVerdict, saveMint} from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Write a verdict on chain against a freshly minted receivable.
 *
 * recordVerdict is onlyOwner by design: a freelancer must not be able to price their own
 * paper, so this is the one call the underwriting service makes with its own key rather
 * than the user's wallet.
 *
 * The values written are read back out of storage by hash. The client supplies only which
 * token and which verdict, never the numbers. If the rate and confidence came from the
 * request body, anyone could mint a receivable and post themselves a 95% advance, and the
 * on-chain record would agree with them.
 */
export async function POST(request: Request) {
  if (!contractDeployed || !CONTRACT_ADDRESS) {
    return Response.json(
      {error: "not_deployed", detail: "No contract address is configured for this network."},
      {status: 503},
    );
  }

  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key) {
    return Response.json(
      {
        error: "signer_unavailable",
        detail: "The underwriting service has no signing key configured.",
      },
      {status: 503},
    );
  }

  let body: {tokenId?: string | number; verdictHash?: string};
  try {
    body = await request.json();
  } catch {
    return Response.json({error: "invalid json"}, {status: 400});
  }

  const {tokenId, verdictHash} = body;
  if (tokenId === undefined || !verdictHash || !/^0x[0-9a-fA-F]{64}$/.test(verdictHash)) {
    return Response.json(
      {error: "invalid_input", detail: "Expected a tokenId and a 32 byte verdictHash."},
      {status: 400},
    );
  }

  const stored = await findVerdict(verdictHash);
  if (!stored) {
    return Response.json(
      {
        error: "unknown_verdict",
        detail: "That verdict is not on record, so there is nothing to attest to.",
      },
      {status: 404},
    );
  }

  const arbiter = stored.arbiter as {advance_rate: number; confidence: number};
  const extraction = stored.extraction as {amount: number | null};

  if (extraction.amount === null) {
    return Response.json(
      {error: "no_amount", detail: "That verdict has no face value to price against."},
      {status: 422},
    );
  }

  // Recompute from the face value and the arbiter's rate rather than trusting the stored
  // advance_value column, so a tampered row cannot inflate what goes on chain.
  const faceMinor = BigInt(Math.round(extraction.amount * 100));
  const advanceMinor = (faceMinor * BigInt(Math.round(arbiter.advance_rate))) / 100n;

  try {
    const account = privateKeyToAccount(key as `0x${string}`);
    const wallet = createWalletClient({account, chain: activeChain, transport: http()});
    const publicClient = createPublicClient({chain: activeChain, transport: http()});

    const hash = await wallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: TENOR_ABI,
      functionName: "recordVerdict",
      args: [
        BigInt(tokenId),
        advanceMinor,
        Math.round(arbiter.confidence),
        verdictHash as `0x${string}`,
      ],
    });

    const receipt = await publicClient.waitForTransactionReceipt({hash});

    await saveMint({
      verdictHash,
      tokenId: String(tokenId),
      txHash: hash,
      network: String(ACTIVE_CHAIN_ID),
    });

    return Response.json({
      txHash: hash,
      status: receipt.status,
      tokenId: String(tokenId),
      advanceValue: advanceMinor.toString(),
      confidence: Math.round(arbiter.confidence),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    console.error("recordVerdict failed", detail);
    return Response.json({error: "record_failed", detail}, {status: 502});
  }
}
