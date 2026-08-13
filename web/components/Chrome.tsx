import Link from "next/link";

export function Header() {
  return (
    <header style={{borderBottom: "1px solid var(--line)"}}>
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
            textDecoration: "none",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontSize: 20,
            color: "var(--green)",
          }}
        >
          Tenor
        </Link>
        <nav style={{display: "flex", alignItems: "center", gap: 22, fontSize: 14}}>
          <Link href="/#how" style={{textDecoration: "none"}}>
            How it works
          </Link>
          <Link href="/docs" style={{textDecoration: "none"}}>
            Docs
          </Link>
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
        background: "var(--green)",
        color: "#ffffff",
        padding: compact ? "10px 18px" : "17px 34px",
        fontSize: compact ? 14 : 17,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        border: "1px solid var(--green)",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

export function Footer() {
  return (
    <footer style={{borderTop: "1px solid var(--line)", marginTop: 96}}>
      <div className="wrap" style={{padding: "36px 0 56px", display: "grid", gap: 20}}>
        <div
          style={{
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontSize: 18,
            color: "var(--green)",
          }}
        >
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
