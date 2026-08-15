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

const NAV = [
  {label: "Method", href: "/#how"},
  {label: "Evidence", href: "/#evidence"},
  {label: "On chain", href: "/#chain"},
];

export function Header() {
  return (
    <header>
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 82,
          gap: 20,
        }}
      >
        <Link href="/" style={{textDecoration: "none", flex: "none"}}>
          <Wordmark size={27} />
        </Link>

        {/* Centre rail. Hidden on narrow screens rather than wrapped, because a nav that
            wraps under the wordmark reads as a mistake. */}
        <nav className="nav-rail">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{display: "flex", alignItems: "center", gap: 10, flex: "none"}}>
          <Link href="/node" className="pill pill-ghost">
            Value a node <span aria-hidden>↗</span>
          </Link>
          <Link href="/node" className="pill pill-solid">
            List a node
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: "var(--vermilion)",
                display: "inline-block",
              }}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

const FOOTER_LINKS: {heading: string; links: {label: string; href: string}[]}[] = [
  {
    heading: "Product",
    links: [
      {label: "List a node", href: "/node"},
      {label: "Method", href: "/#how"},
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
