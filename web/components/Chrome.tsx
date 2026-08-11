import Link from "next/link";

/**
 * A wordmark built from a 3x3 matrix of squares with one cell knocked out. OKX's identity
 * is letterforms assembled from square modules; this borrows the construction rather than
 * the letterforms.
 */
export function Mark({size = 20}: {size?: number}) {
  const cells = [0, 1, 2, 3, 5, 6, 7, 8];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 9 9"
      aria-hidden="true"
      style={{display: "block", flex: "0 0 auto"}}
    >
      {cells.map((cell) => (
        <rect
          key={cell}
          x={(cell % 3) * 3}
          y={Math.floor(cell / 3) * 3}
          width="2.4"
          height="2.4"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function Header() {
  return (
    <header style={{borderBottom: "1px solid var(--rule)"}}>
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 62,
          gap: 20,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            fontWeight: 700,
            letterSpacing: "0.02em",
            fontSize: 17,
          }}
        >
          <Mark />
          Tenor
        </Link>
        <nav style={{display: "flex", alignItems: "center", gap: 22, fontSize: 14}}>
          <a href="#how" style={{textDecoration: "none"}}>
            How it works
          </a>
          <a href="#faq" style={{textDecoration: "none"}}>
            FAQ
          </a>
          <Link href="/price" style={{textDecoration: "none"}}>
            <Cta compact>Price a receivable</Cta>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Cta({children, compact = false}: {children: React.ReactNode; compact?: boolean}) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "var(--ink)",
        color: "var(--paper)",
        padding: compact ? "9px 16px" : "16px 28px",
        fontSize: compact ? 14 : 17,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        border: "1px solid var(--ink)",
      }}
    >
      {children}
    </span>
  );
}

export function Footer() {
  return (
    <footer style={{borderTop: "1px solid var(--rule)", marginTop: 96}}>
      <div className="wrap" style={{padding: "36px 0 56px", display: "grid", gap: 20}}>
        <div style={{display: "flex", alignItems: "center", gap: 10, fontWeight: 700}}>
          <Mark size={16} />
          Tenor
        </div>
        <p style={{maxWidth: "70ch", fontSize: 14, color: "var(--ink-60)"}}>
          Tenor is a prototype and a technical demonstration, built for the X Layer AI Season
          hackathon. It is not a live financial product, it does not accept money from real
          users, and every document, company and figure shown here is fictional. Nothing on
          this site is financial advice or an offer of credit.
        </p>
        <p className="mono" style={{fontSize: 12, color: "var(--ink-40)"}}>
          Deployed on X Layer · AI-RWA
        </p>
      </div>
    </footer>
  );
}
