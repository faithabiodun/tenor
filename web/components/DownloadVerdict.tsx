"use client";

import {useState} from "react";
import type {Verdict} from "../lib/types";

/**
 * Download the assessment as a file the freelancer owns.
 *
 * The canonical bytes are included verbatim rather than re-serialised on the client,
 * because they are the thing the hash commits to. Re-serialising here would risk shipping
 * a file whose own instructions do not reproduce its own hash, which is worse than not
 * offering the download at all.
 */
export function DownloadVerdict({verdict}: {verdict: Verdict}) {
  const [saved, setSaved] = useState(false);

  function download() {
    const {extraction, arbiter} = verdict.reasoning;

    const payload = {
      tenor: {
        assessed_at: new Date().toISOString(),
        payer: extraction.client_name,
        freelancer: extraction.freelancer_name,
        face_value: extraction.amount,
        currency: extraction.currency,
        due_date: extraction.due_date,
        advance_rate_percent: arbiter.advance_rate,
        advance_value: verdict.advanceValue,
        confidence: arbiter.confidence,
        rationale: arbiter.rationale,
      },
      verdict_hash: verdict.verdictHash,
      how_to_verify: [
        "1. Take the `reasoning` object below.",
        "2. Serialise it as JSON with object keys sorted at every level, array order kept, and no whitespace.",
        "3. keccak256 the UTF-8 bytes of that string.",
        "4. The result must equal verdict_hash. `canonical_json` below is exactly that string, so you can hash it directly to check step 2.",
      ],
      canonical_json: verdict.canonicalJson,
      reasoning: verdict.reasoning,
    };

    const name = (extraction.client_name ?? "receivable")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tenor-${name}-${verdict.verdictHash.slice(2, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
    } catch {
      // Wallet in-app browsers frequently block blob downloads. The same reasoning is
      // served publicly by hash, so open that rather than failing silently.
      window.open(`/api/verdict/${verdict.verdictHash}`, "_blank");
    }
  }

  return (
    <button
      onClick={download}
      style={{
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        padding: "10px 18px",
        borderRadius: 999,
        border: "1px solid var(--green)",
        background: saved ? "var(--green-wash)" : "transparent",
        color: "var(--green-deep)",
      }}
    >
      {saved ? "Saved" : "Download this assessment"}
    </button>
  );
}
