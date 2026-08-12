import type {Hex} from "viem";
import {canonicalise, verdictHash} from "./canonical";
import {ask} from "./llm";
import {
  ARBITER_SYSTEM,
  BEAR_SYSTEM,
  BULL_SYSTEM,
  arbiterUser,
  debateUser,
} from "./prompts";
import {
  ArbiterSchema,
  BearSchema,
  BullSchema,
  QUALITY_FLOOR,
  type Arbiter,
  type Bear,
  type Bull,
  type Extraction,
  type Reasoning,
} from "./schemas";

/** Thrown when the document is too poor to price. The UI asks for a better scan. */
export class DocumentQualityError extends Error {
  constructor(readonly quality: number) {
    super(
      `This document scored ${quality} out of 100 for legibility, below the ${QUALITY_FLOOR} ` +
        `needed to price it. Upload a clearer scan or a text PDF and we will try again.`,
    );
    this.name = "DocumentQualityError";
  }
}

export type AgentName = "bull" | "bear" | "arbiter";
export type Progress = (agent: AgentName, state: "start" | "done") => void;

export interface Verdict {
  reasoning: Reasoning;
  /** The exact bytes that were hashed. Store this verbatim; it is what makes the hash checkable. */
  canonicalJson: string;
  verdictHash: Hex;
  /**
   * Face value scaled by the arbiter's rate, in the same units as extraction.amount, so
   * whole currency units. The contract stores minor units; convert at the mint boundary.
   */
  advanceValue: number;
  /** How far apart the two debaters landed, in percentage points. Always positive. */
  spread: number;
  /**
   * True when the bull came in below the bear, which means the freelancer's advocate
   * argued against its own client. That is a broken debate, not a wide one, and an absolute
   * spread hides it: a 15 point inversion looks exactly like a healthy 15 point gap.
   */
  inverted: boolean;
}

/**
 * Section 7.6: quality gate, then bull and bear in parallel, then the arbiter.
 *
 * Running the debaters concurrently roughly halves latency, which matters in a live demo.
 * It is also the honest ordering: neither debater should see the other's number, or the
 * second one anchors on the first.
 */
export async function priceReceivable(
  extraction: Extraction,
  onProgress: Progress = () => {},
): Promise<Verdict> {
  if (extraction.document_quality < QUALITY_FLOOR) {
    throw new DocumentQualityError(extraction.document_quality);
  }

  const user = debateUser(extraction);

  onProgress("bull", "start");
  onProgress("bear", "start");

  const [bull, bear] = await Promise.all([
    ask<Bull>({
      label: "bull",
      system: BULL_SYSTEM,
      user,
      schema: BullSchema,
      temperature: 0.7,
    }).then((result) => {
      onProgress("bull", "done");
      return result;
    }),
    ask<Bear>({
      label: "bear",
      system: BEAR_SYSTEM,
      user,
      schema: BearSchema,
      temperature: 0.7,
    }).then((result) => {
      onProgress("bear", "done");
      return result;
    }),
  ]);

  onProgress("arbiter", "start");
  const arbiter = await ask<Arbiter>({
    label: "arbiter",
    system: ARBITER_SYSTEM,
    user: arbiterUser(extraction, bull, bear),
    schema: ArbiterSchema,
    // Cold, so the same debate produces the same verdict. The disagreement is supposed to
    // come from the two debaters, not from sampling noise in the judge.
    temperature: 0,
  });
  onProgress("arbiter", "done");

  const reasoning: Reasoning = {extraction, bull, bear, arbiter};

  return {
    reasoning,
    canonicalJson: canonicalise(reasoning),
    verdictHash: verdictHash(reasoning),
    advanceValue: Math.round(((extraction.amount ?? 0) * arbiter.advance_rate) / 100),
    spread: Math.abs(bull.proposed_rate - bear.proposed_rate),
    inverted: bull.proposed_rate < bear.proposed_rate,
  };
}
