"use client";

import {useEffect, useRef, useState} from "react";

interface Props {
  bull: number;
  bear: number;
  verdict: number;
}

/**
 * The signature element. A single track from 0 to 100 with the two proposals marked and a
 * hatched band spanning the distance between them, so the disagreement is a physical width
 * on the page rather than two numbers a reader has to subtract in their head.
 *
 * The verdict marker starts at the bear's number and slides to where it landed, once. It
 * moves from the cautious end because that is the direction of the argument: the bear sets
 * the floor and the bull pulls against it.
 */
export function SpreadBar({bull, bear, verdict}: Props) {
  const low = Math.min(bull, bear);
  const high = Math.max(bull, bear);
  const [marker, setMarker] = useState(low);
  const settled = useRef(false);

  useEffect(() => {
    if (settled.current) return;
    settled.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setMarker(verdict);
      return;
    }
    const id = window.setTimeout(() => setMarker(verdict), 420);
    return () => window.clearTimeout(id);
  }, [verdict]);

  return (
    <figure style={{margin: "0"}}>
      <div style={{position: "relative", height: 76}}>
        <div
          style={{
            position: "absolute",
            insetInline: 0,
            top: 38,
            height: 1,
            background: "var(--rule)",
          }}
        />

        <div
          className="hatch"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${low}%`,
            width: `${high - low}%`,
            top: 26,
            height: 25,
            opacity: 0.55,
            borderLeft: "1px solid var(--ink)",
            borderRight: "1px solid var(--ink)",
          }}
        />

        <Proposal side="bear" value={bear} />
        <Proposal side="bull" value={bull} />

        <div
          style={{
            position: "absolute",
            left: `${marker}%`,
            top: 12,
            transform: "translateX(-50%)",
            transition: "left 900ms cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            className="mono"
            style={{fontSize: 13, fontWeight: 700, whiteSpace: "nowrap"}}
          >
            {verdict}%
          </span>
          <span style={{width: 3, height: 30, background: "var(--ink)"}} />
        </div>

        {[0, 25, 50, 75, 100].map((tick) => (
          <span
            key={tick}
            className="mono"
            style={{
              position: "absolute",
              left: `${tick}%`,
              top: 46,
              transform: "translateX(-50%)",
              fontSize: 11,
              color: "var(--ink-40)",
            }}
          >
            {tick}
          </span>
        ))}
      </div>

      <figcaption className="mono" style={{fontSize: 12, color: "var(--ink-60)"}}>
        {(high - low).toFixed(0)} points between them
      </figcaption>
    </figure>
  );
}

function Proposal({side, value}: {side: "bull" | "bear"; value: number}) {
  const isBull = side === "bull";
  return (
    <div
      style={{
        position: "absolute",
        left: `${value}%`,
        top: 30,
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        aria-hidden="true"
        className={isBull ? undefined : "hatch"}
        style={{
          width: 13,
          height: 13,
          border: "1px solid var(--ink)",
          background: isBull ? "var(--ink)" : "var(--paper)",
        }}
      />
      <span className="mono" style={{fontSize: 11, color: "var(--ink-60)"}}>
        {value}
      </span>
      <span className="sr-only">
        {isBull ? "Case for" : "Case against"}: {value} percent
      </span>
    </div>
  );
}
