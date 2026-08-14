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
          minHeight: 62,
          gap: 16,
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
        <nav style={{display: "flex", alignItems: "center", gap: 20, fontSize: 14}}>
          <Link href="/#how" className="nav-secondary" style={{textDecoration: "none"}}>
            How it works
          </Link>
          <Link href="/ledger" className="nav-secondary" style={{textDecoration: "none"}}>
            Ledger
          </Link>
          <Link href="/docs" className="nav-secondary" style={{textDecoration: "none"}}>
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

const FOOTER_LINKS: {heading: string; links: {label: string; href: string}[]}[] = [
  {
    heading: "Product",
    links: [
      {label: "Price a receivable", href: "/price"},
      {label: "How it works", href: "/#how"},
      {label: "Ledger", href: "/ledger"},
      {label: "Docs", href: "/docs"},
    ],
  },
  {
    heading: "Technical",
    links: [
      {label: "What goes on chain", href: "/docs#chain"},
      {label: "Verifying a verdict", href: "/docs#verify"},
      {label: "Source on GitHub", href: "https://github.com/faithabiodun/tenor"},
    ],
  },
  {
    heading: "X Layer",
    links: [
      {label: "X Layer", href: "https://web3.okx.com/xlayer"},
      {label: "Developer docs", href: "https://web3.okx.com/xlayer/docs"},
      {label: "Explorer", href: "https://www.oklink.com/x-layer"},
    ],
  },
];

export function Footer() {
  return (
    <footer style={{borderTop: "1px solid var(--line)", marginTop: 96}}>
      <div className="wrap" style={{padding: "44px 0 56px"}}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 32,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                letterSpacing: "-0.03em",
                fontSize: 20,
                color: "var(--green)",
              }}
            >
              Tenor
            </div>
            <p style={{marginTop: 8, fontSize: 14, color: "var(--ink-60)", maxWidth: "26ch"}}>
              Adversarial underwriting for freelancer receivables.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="eyebrow" style={{marginBottom: 12}}>
                {group.heading}
              </p>
              <ul style={{listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9}}>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{fontSize: 14, color: "var(--ink-60)", textDecoration: "none"}}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p
          style={{
            marginTop: 40,
            paddingTop: 22,
            borderTop: "1px solid var(--line)",
            maxWidth: "78ch",
            fontSize: 13,
            color: "var(--ink-40)",
          }}
        >
          Tenor is built for the X Layer AI Season hackathon. It does not accept money from
          real users, and every document, company and figure shown here is fictional. Nothing
          on this site is financial advice or an offer of credit.
        </p>
      </div>
    </footer>
  );
}
