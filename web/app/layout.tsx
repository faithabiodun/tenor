import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";

// The reference site runs Geist Variable; this is the same family from Google Fonts.
const display = Geist({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
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
