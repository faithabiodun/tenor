import {defineChain} from "viem";

/**
 * X Layer, OKX's Ethereum L2.
 *
 * Chain ids confirmed with eth_chainId against the live RPCs rather than taken from a chain
 * list: the testnet answers 1952, not the 195 that ChainList, thirdweb and chainid.network
 * all still advertise. 195 is the retired Polygon CDK zkEVM testnet; X Layer moved to an
 * enhanced OP Stack in the August 2025 upgrade.
 */
export const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: {name: "OKB", symbol: "OKB", decimals: 18},
  rpcUrls: {default: {http: ["https://testrpc.xlayer.tech"]}},
  blockExplorers: {
    default: {name: "OKLink", url: "https://www.oklink.com/x-layer-testnet"},
  },
  testnet: true,
});

export const xLayerMainnet = defineChain({
  id: 196,
  name: "X Layer",
  nativeCurrency: {name: "OKB", symbol: "OKB", decimals: 18},
  rpcUrls: {default: {http: ["https://rpc.xlayer.tech"]}},
  blockExplorers: {
    default: {name: "OKLink", url: "https://www.oklink.com/x-layer"},
  },
});

const CHAINS = {1952: xLayerTestnet, 196: xLayerMainnet} as const;

export type SupportedChainId = keyof typeof CHAINS;

export function chainById(id: number) {
  return CHAINS[id as SupportedChainId] ?? null;
}

/** Which network this deployment targets. Testnet unless told otherwise. */
export const ACTIVE_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? 1952,
) as SupportedChainId;

export const activeChain = CHAINS[ACTIVE_CHAIN_ID] ?? xLayerTestnet;

/**
 * The deployed contract, or null before day one of the deploy. Everything downstream checks
 * this rather than assuming an address exists, so the UI can say "not deployed yet" instead
 * of failing at signing time.
 */
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined) || null;

export const contractDeployed = Boolean(
  CONTRACT_ADDRESS && /^0x[0-9a-fA-F]{40}$/.test(CONTRACT_ADDRESS),
);

export function explorerTx(hash: string, chainId: number = ACTIVE_CHAIN_ID): string {
  const chain = chainById(chainId) ?? activeChain;
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddress(address: string, chainId: number = ACTIVE_CHAIN_ID): string {
  const chain = chainById(chainId) ?? activeChain;
  return `${chain.blockExplorers.default.url}/address/${address}`;
}

/**
 * The contract stores money in minor units, the extraction reads it in whole currency
 * units. Convert at this boundary and nowhere else, so the two representations cannot
 * quietly drift into each other.
 */
export function toMinorUnits(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

/** Seconds since epoch for a YYYY-MM-DD date, at midnight UTC. */
export function toUnixSeconds(date: string): bigint {
  return BigInt(Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000));
}
