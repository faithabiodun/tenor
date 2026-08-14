"use client";

import {useEffect, useRef, useState} from "react";

interface Props {
  bull: number;
  bear: number;
  verdict: number;
}

/**
 * The signature element. A single track from 0 to 100 with the two proposals marked and a
 * tinted band spanning the distance between them, so the disagreement is a physical width
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
            left: 0,
            right: 0,
            top: 38,
            height: 1,
            background: "var(--line)",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${low}%`,
            width: `${high - low}%`,
            top: 33,
            height: 11,
            borderRadius: 6,
            background: "var(--green-wash)",
            border: "1px solid var(--green-line)",
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
            style={{
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              color: "var(--green-deep)",
            }}
          >
            {verdict}%
          </span>
          <span
            style={{width: 3, height: 30, borderRadius: 2, background: "var(--green)"}}
          />
        </div>

        {[0, 25, 50, 75, 100].map((tick) => (
          <span
            key={tick}
            className="mono"
            style={{
              position: "absolute",
              left: `${tick}%`,
              top: 46,
              // The end labels would sit half outside the track and clip on a narrow
              // screen, so they hang inwards instead of centring on their tick.
              transform: `translateX(${tick === 0 ? "0" : tick === 100 ? "-100%" : "-50%"})`,
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
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          border: `1px solid ${isBull ? "var(--green)" : "var(--ink-60)"}`,
          background: isBull ? "var(--green)" : "var(--paper)",
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
