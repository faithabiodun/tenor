import Link from "next/link";

/** The wordmark, set the way the reference sheet sets it: heavy, italic, with a tick. */
export function Wordmark({size = 21}: {size?: number}) {
  return (
    <span style={{display: "inline-flex", alignItems: "flex-start", gap: 3}}>
      <span className="display" style={{fontSize: size, lineHeight: 1}}>
        Uptime
      </span>
      <span
        aria-hidden
        style={{
          width: Math.max(2, size * 0.1),
          height: size * 0.52,
          background: "var(--vermilion)",
          transform: "skewX(-12deg)",
          marginTop: size * 0.05,
        }}
      />
    </span>
  );
}

export function Header() {
  return (
    <header style={{borderBottom: "1px solid var(--line)"}}>
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 64,
          gap: 16,
        }}
      >
        <Link href="/" style={{textDecoration: "none"}}>
          <Wordmark />
        </Link>
        <nav style={{display: "flex", alignItems: "center", gap: 22}}>
          <Link href="/node" className="btn" style={{padding: "11px 20px"}}>
            List a node
          </Link>
        </nav>
      </div>
    </header>
  );
}

const FOOTER_LINKS: {heading: string; links: {label: string; href: string}[]}[] = [
  {
    heading: "Product",
    links: [
      {label: "List a node", href: "/node"},
      {label: "On chain", href: "/#how"},
    ],
  },
  {
    heading: "Technical",
    links: [{label: "Source on GitHub", href: "https://github.com/faithabiodun/uptime"}],
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
    <footer style={{borderTop: "1px solid var(--line)", marginTop: 110}}>
      <div className="wrap" style={{padding: "46px 0 58px"}}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 34,
            alignItems: "start",
          }}
        >
          <div>
            <Wordmark size={19} />
            <p style={{marginTop: 10, fontSize: 14, color: "var(--ink-50)", maxWidth: "26ch"}}>
              Adversarial pricing for infrastructure that already earns.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="spec" style={{marginBottom: 13}}>
                {group.heading}
              </p>
              <ul style={{listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9}}>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{fontSize: 14, color: "var(--ink-70)", textDecoration: "none"}}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div style={{display: "flex", alignItems: "center", gap: 14, marginTop: 42}}>
          <div className="rule" style={{flex: 1}} />
          <div className="crosshair" />
        </div>

        <p style={{marginTop: 20, maxWidth: "80ch", fontSize: 13, color: "var(--ink-50)"}}>
          Uptime is built for the X Layer AI Season hackathon. It does not take money from real
          users. Sample nodes are clearly labelled as fixtures and their earnings histories are
          generated, not observed. Nothing here is financial advice or an offer of credit.
        </p>
      </div>
    </footer>
  );
}
