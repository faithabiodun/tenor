import {keccak256, toBytes, type Hex} from "viem";

/**
 * Canonical JSON, deliberately boring so a third party can reproduce it:
 *
 *   1. object keys sorted lexicographically by UTF-16 code unit, at every level
 *   2. arrays keep their order, because order is meaningful
 *   3. no whitespace anywhere
 *   4. UTF-8 on the way to bytes
 *
 * The verdict hash written on chain is keccak256 over exactly these bytes. If the
 * stored reasoning JSON is re-canonicalised and re-hashed, it must match, which is
 * what stops the rationale being quietly rewritten after pricing.
 */
export function canonicalise(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);

  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    // Default sort is by UTF-16 code unit, which is stable across engines. Do not
    // swap in localeCompare here: it is locale-dependent and would make the hash
    // depend on where it was computed.
    for (const key of Object.keys(source).sort()) {
      const entry = source[key];
      // JSON.stringify drops undefined values in objects. Drop them here too so the
      // sorted copy and the serialised output agree about which keys exist.
      if (entry !== undefined) sorted[key] = sortDeep(entry);
    }
    return sorted;
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error(`cannot canonicalise non-finite number: ${value}`);
  }

  return value;
}

/** keccak256 over the canonical JSON of the reasoning object. */
export function verdictHash(reasoning: unknown): Hex {
  return keccak256(toBytes(canonicalise(reasoning)));
}

/** keccak256 over the uploaded document bytes, exactly as uploaded. */
export function documentHash(bytes: Uint8Array): Hex {
  return keccak256(bytes);
}

/**
 * Re-derive the hash from stored reasoning JSON and compare. This is the check a
 * judge (or anyone) runs to verify the on-chain commitment.
 */
export function verifyVerdictHash(reasoning: unknown, expected: Hex): boolean {
  return verdictHash(reasoning).toLowerCase() === expected.toLowerCase();
}
