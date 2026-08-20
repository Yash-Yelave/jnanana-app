import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Serif,
  JetBrains_Mono,
  Manrope,
  Noto_Serif_Devanagari,
  Noto_Serif_Telugu,
} from "next/font/google";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/env";
import "./globals.css";

// The four faces from the Jṉanana design system (§3). Each has exactly one job:
// display carries the claim, serif carries the voice, mono carries the facts,
// body carries the reading.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Instrument Serif is Latin-only. These carry the Devanagari and Telugu
// spellings of "Jnana" in the statement band; serif, so they sit with it
// rather than dropping to a system font. Subset-scoped, so each request
// only fetches the script it needs.
const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400"],
  variable: "--font-devanagari",
  display: "swap",
});

const notoTelugu = Noto_Serif_Telugu({
  subsets: ["telugu"],
  weight: ["400"],
  variable: "--font-telugu",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Jnanana Foundation | Learn with top mentors",
    template: "%s | Jnanana Foundation",
  },
  description:
    "Connect, learn and grow with personalized mentoring and practical lessons from experienced professionals.",
  openGraph: {
    title: "Jnanana Foundation | Learn with top mentors",
    description:
      "Connect, learn and grow with personalized mentoring and practical lessons.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141210",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${manrope.variable} ${notoDevanagari.variable} ${notoTelugu.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
