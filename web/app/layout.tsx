import type {Metadata} from "next";
import {Archivo, Geist_Mono} from "next/font/google";
import "./globals.css";

// Archivo carries the display voice: it has a true 900 and a real italic, which is what the
// heavy slanted wordmark on the reference sheet needs. Faux-oblique would shear the letters
// and look exactly like what it is.
const display = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Uptime — sell the earnings your machine has not made yet",
  description:
    "Two AI agents with opposing incentives argue about what a node's future earnings are " +
    "worth today. A third decides, and the reasoning is hashed on X Layer.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
