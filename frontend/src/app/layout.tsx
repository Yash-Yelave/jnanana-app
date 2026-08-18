import type { Metadata, Viewport } from "next";
import { Manrope, Public_Sans, Sue_Ellen_Francisco } from "next/font/google";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const handwritten = Sue_Ellen_Francisco({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-handwritten",
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
  themeColor: "#0f0f0f",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${publicSans.variable} ${handwritten.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
