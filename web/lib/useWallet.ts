"use client";

import {useCallback, useEffect, useState} from "react";
import {createWalletClient, custom, type WalletClient} from "viem";
import {ACTIVE_CHAIN_ID, activeChain} from "./chain";

/**
 * Minimal EIP-1193 wallet binding.
 *
 * viem on its own rather than wagmi: the spec's stated need is connect, sign and mint, and
 * that is a hook and two handlers. wagmi brings a provider tree and a connector registry
 * for multi-wallet, multi-chain apps this is not, and viem is already a dependency. The
 * cost is handling accountsChanged and chainChanged ourselves, which is the block below.
 */
interface Eip1193Provider {
  request: (args: {method: string; params?: unknown[]}) => Promise<unknown>;
  on?: (event: string, handler: (...args: never[]) => void) => void;
  removeListener?: (event: string, handler: (...args: never[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export interface Wallet {
  available: boolean;
  address: `0x${string}` | null;
  chainId: number | null;
  onRightChain: boolean;
  connecting: boolean;
  error: string;
  connect: () => Promise<void>;
  switchChain: () => Promise<void>;
  client: () => WalletClient | null;
}

export function useWallet(): Wallet {
  const [available, setAvailable] = useState(false);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;
    setAvailable(true);

    // Pick up an already-authorised account without prompting. eth_accounts is silent;
    // eth_requestAccounts is the one that opens the wallet.
    void provider
      .request({method: "eth_accounts"})
      .then((accounts) => {
        const [first] = accounts as `0x${string}`[];
        if (first) setAddress(first);
      })
      .catch(() => {});

    void provider
      .request({method: "eth_chainId"})
      .then((id) => setChainId(Number(id as string)))
      .catch(() => {});

    const onAccounts = (...args: never[]) => {
      const [first] = (args[0] as unknown as `0x${string}`[]) ?? [];
      setAddress(first ?? null);
    };
    const onChain = (...args: never[]) => setChainId(Number(args[0] as unknown as string));

    provider.on?.("accountsChanged", onAccounts);
    provider.on?.("chainChanged", onChain);
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) {
      setError("No wallet found. Install OKX Wallet or MetaMask and reload.");
      return;
    }
    setConnecting(true);
    setError("");
    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as `0x${string}`[];
      setAddress(accounts[0] ?? null);
      const id = (await provider.request({method: "eth_chainId"})) as string;
      setChainId(Number(id));
    } catch (cause) {
      // 4001 is the user closing the prompt. Not an error worth shouting about.
      const code = (cause as {code?: number}).code;
      setError(code === 4001 ? "" : "Could not connect to your wallet.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const switchChain = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) return;
    const hexId = `0x${ACTIVE_CHAIN_ID.toString(16)}`;
    try {
      await provider.request({method: "wallet_switchEthereumChain", params: [{chainId: hexId}]});
    } catch (cause) {
      // 4902 means the wallet has never heard of this chain, which is the common case for
      // X Layer. Offer to add it rather than dead-ending the user.
      if ((cause as {code?: number}).code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexId,
              chainName: activeChain.name,
              nativeCurrency: activeChain.nativeCurrency,
              rpcUrls: [...activeChain.rpcUrls.default.http],
              blockExplorerUrls: [activeChain.blockExplorers.default.url],
            },
          ],
        });
      } else {
        setError("Could not switch network. Change it in your wallet and try again.");
      }
    }
  }, []);

  const client = useCallback(() => {
    const provider = window.ethereum;
    if (!provider || !address) return null;
    return createWalletClient({account: address, chain: activeChain, transport: custom(provider)});
  }, [address]);

  return {
    available,
    address,
    chainId,
    onRightChain: chainId === ACTIVE_CHAIN_ID,
    connecting,
    error,
    connect,
    switchChain,
    client,
  };
}
