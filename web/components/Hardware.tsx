/**
 * The performance study.
 *
 * A solid compute card, then three wireframe echoes receding to the right. The sequence is
 * the product and the colours are load bearing: solid is revenue the chain has recorded,
 * and each ghost sits further into a projection, drawn fainter because less is known about
 * it. Vermilion is the near projection, ash the middle, blue the far edge.
 *
 * Only the measured card gets detail, a shadow and a red accent. A projection has nothing
 * to show and casts nothing, and that asymmetry is the honest part of the drawing.
 */
export function Hardware() {
  return (
    <svg
      viewBox="0 0 1240 560"
      role="img"
      aria-label="A compute card rendered solid, followed by three wireframe copies receding to the right, each fainter than the last, representing earnings that have been observed and months that are only projected."
      style={{width: "100%", height: "auto", display: "block", overflow: "visible"}}
    >
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a3f" />
          <stop offset="0.45" stopColor="#232327" />
          <stop offset="1" stopColor="#161619" />
        </linearGradient>
        <linearGradient id="shroud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4a50" />
          <stop offset="1" stopColor="#1d1d21" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d33f27" stopOpacity="0.16" />
          <stop offset="1" stopColor="#d33f27" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pins" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9a227" />
          <stop offset="1" stopColor="#8a6f18" />
        </linearGradient>
      </defs>

      {/* Warm bloom behind the real card, so the eye lands on the measured thing first. */}
      <ellipse cx="420" cy="270" rx="360" ry="220" fill="url(#glow)" />

      <Ghost x={706} stroke="var(--ghost-near)" opacity={0.85} />
      <Ghost x={868} stroke="var(--ghost-mid)" opacity={0.7} />
      <Ghost x={1030} stroke="var(--ghost-far)" opacity={0.6} />

      <Card />

      {/* Contact shadow. Only real things cast one. */}
      <ellipse cx="430" cy="474" rx="290" ry="9" fill="#1c1c1e" opacity="0.15" />
      <ellipse cx="430" cy="474" rx="170" ry="5" fill="#1c1c1e" opacity="0.16" />

      {/* Annotation into the far ghost, as on the reference sheet. */}
      <g>
        <text
          x="1232"
          y="150"
          textAnchor="end"
          className="mono"
          fontSize="11"
          letterSpacing="2.2"
          fill="var(--ink-70)"
        >
          OBSERVED BEFORE PROJECTED
        </text>
        <path
          d="M1228 162 L1228 196 L1120 196 L1120 246"
          fill="none"
          stroke="var(--ink-30)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </g>

      <g stroke="var(--ink-30)" strokeWidth="1" fill="none" opacity="0.55">
        <line x1="1188" y1="330" x2="1214" y2="330" />
        <line x1="1201" y1="317" x2="1201" y2="343" />
        <circle cx="1201" cy="330" r="7" />
      </g>
    </svg>
  );
}

const CARD_X = 150;
const CARD_Y = 190;
const CARD_W = 560;
const CARD_H = 250;

/** The measured card: bracket, shroud, three fans, accent lighting, contact pins. */
function Card() {
  const x = CARD_X;
  const y = CARD_Y;
  const w = CARD_W;
  const h = CARD_H;

  return (
    <g>
      {/* PCI bracket, with vent slots. */}
      <path
        d={`M${x - 34},${y - 6} L${x - 8},${y - 6} L${x - 8},${y + h + 22} L${x - 34},${y + h + 22} Z`}
        fill="#2a2a2e"
        stroke="#121214"
        strokeWidth="1.5"
      />
      {Array.from({length: 7}, (_, i) => (
        <rect
          key={i}
          x={x - 29}
          y={y + 14 + i * 28}
          width="16"
          height="15"
          rx="1.5"
          fill="#141416"
        />
      ))}

      {/* PCB tail and gold contact fingers. */}
      <path
        d={`M${x - 8},${y + h - 4} L${x + w - 120},${y + h - 4} L${x + w - 120},${y + h + 30} L${x + 42},${y + h + 30} Z`}
        fill="#1a2a20"
        stroke="#101a14"
        strokeWidth="1"
      />
      {Array.from({length: 26}, (_, i) => (
        <rect
          key={i}
          x={x + 58 + i * 13}
          y={y + h + 12}
          width="8"
          height="18"
          fill="url(#pins)"
        />
      ))}

      {/* Main shroud. */}
      <path
        d={
          `M${x},${y + 26} L${x + 30},${y} L${x + w - 46},${y} L${x + w},${y + 34} ` +
          `L${x + w},${y + h - 28} L${x + w - 34},${y + h} L${x + 26},${y + h} L${x},${y + h - 30} Z`
        }
        fill="url(#body)"
        stroke="#0e0e10"
        strokeWidth="1.5"
      />

      {/* Top rail, catching light. */}
      <path
        d={`M${x + 32},${y + 9} L${x + w - 52},${y + 9}`}
        stroke="#6a6a72"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* The single flash of colour on the real hardware. */}
      <path
        d={`M${x + 40},${y + 19} L${x + w - 118},${y + 19}`}
        stroke="var(--vermilion)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d={`M${x + w - 96},${y + 19} L${x + w - 60},${y + 19}`}
        stroke="var(--vermilion)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Fans. */}
      {[0.235, 0.5, 0.765].map((t, i) => (
        <Fan key={i} cx={x + w * t} cy={y + h / 2 + 6} label={["UPTIME", "01", "UPTIME"][i]!} />
      ))}

      {/* Serial plate, bottom left of the shroud. */}
      <g>
        <rect x={x + 22} y={y + h - 74} width="62" height="58" rx="3" fill="#101012" opacity="0.85" />
        <text x={x + 32} y={y + h - 52} className="mono" fontSize="17" fill="#e8e6e1" letterSpacing="0.5">
          UP
        </text>
        <text x={x + 32} y={y + h - 32} className="mono" fontSize="17" fill="var(--vermilion)">
          01
        </text>
        <text x={x + 32} y={y + h - 20} className="mono" fontSize="6" fill="#8b8880" letterSpacing="1.4">
          UPTIME SERIES
        </text>
      </g>
    </g>
  );
}

function Fan({cx, cy, label}: {cx: number; cy: number; label: string}) {
  const R = 78;
  return (
    <g>
      {/* Housing recess. */}
      <circle cx={cx} cy={cy} r={R + 8} fill="#141416" />
      <circle cx={cx} cy={cy} r={R + 8} fill="none" stroke="url(#shroud)" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={R} fill="#0f0f11" />

      {/* Blades. Swept, overlapping, and cut off at the hub the way real ones are. */}
      {Array.from({length: 11}, (_, i) => {
        const a = (i / 11) * Math.PI * 2;
        const a2 = a + 0.62;
        const inner = 24;
        return (
          <path
            key={i}
            d={
              `M${cx + Math.cos(a) * inner},${cy + Math.sin(a) * inner} ` +
              `Q${cx + Math.cos(a + 0.34) * (R * 0.68)},${cy + Math.sin(a + 0.34) * (R * 0.68)} ` +
              `${cx + Math.cos(a2) * (R - 3)},${cy + Math.sin(a2) * (R - 3)} ` +
              `L${cx + Math.cos(a2 - 0.2) * (R - 3)},${cy + Math.sin(a2 - 0.2) * (R - 3)} ` +
              `Q${cx + Math.cos(a + 0.2) * (R * 0.6)},${cy + Math.sin(a + 0.2) * (R * 0.6)} ` +
              `${cx + Math.cos(a - 0.1) * inner},${cy + Math.sin(a - 0.1) * inner} Z`
            }
            fill="#26262b"
            stroke="#3a3a41"
            strokeWidth="0.6"
          />
        );
      })}

      {/* Hub. */}
      <circle cx={cx} cy={cy} r="25" fill="#1b1b1f" stroke="#3d3d44" strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r="25" fill="none" stroke="#000" strokeWidth="0.5" opacity="0.6" />
      <text
        x={cx}
        y={cy + 3.5}
        textAnchor="middle"
        className="mono"
        fontSize={label === "01" ? "12" : "7.5"}
        letterSpacing={label === "01" ? "0" : "0.8"}
        fill="#d8d6d1"
      >
        {label}
      </text>
    </g>
  );
}

/** A projection: the same silhouette, wireframe, no detail, no shadow. */
function Ghost({x, stroke, opacity}: {x: number; stroke: string; opacity: number}) {
  const y = CARD_Y;
  const w = CARD_W;
  const h = CARD_H;

  return (
    <g opacity={opacity} fill="none" stroke={stroke} strokeWidth="1.1">
      <path
        d={
          `M${x},${y + 26} L${x + 30},${y} L${x + w - 46},${y} L${x + w},${y + 34} ` +
          `L${x + w},${y + h - 28} L${x + w - 34},${y + h} L${x + 26},${y + h} L${x},${y + h - 30} Z`
        }
      />
      {[0.235, 0.5, 0.765].map((t, i) => {
        const cx = x + w * t;
        const cy = y + h / 2 + 6;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="86" />
            <circle cx={cx} cy={cy} r="78" />
            <circle cx={cx} cy={cy} r="25" />
            {/* A few blade sweeps, enough to read as the same object without pretending
                to know detail that has not happened yet. */}
            {Array.from({length: 11}, (_, b) => {
              const a = (b / 11) * Math.PI * 2;
              return (
                <path
                  key={b}
                  d={
                    `M${cx + Math.cos(a) * 25},${cy + Math.sin(a) * 25} ` +
                    `Q${cx + Math.cos(a + 0.34) * 53},${cy + Math.sin(a + 0.34) * 53} ` +
                    `${cx + Math.cos(a + 0.62) * 75},${cy + Math.sin(a + 0.62) * 75}`
                  }
                  strokeWidth="0.85"
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
