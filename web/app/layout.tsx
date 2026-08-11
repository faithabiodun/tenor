import type {Metadata} from "next";
import {JetBrains_Mono, Space_Grotesk} from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tenor — get paid for work you have already done",
  description:
    "Two AI agents with opposing incentives argue about what your unpaid invoice is worth " +
    "today. A third decides, and the reasoning is hashed on X Layer.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
