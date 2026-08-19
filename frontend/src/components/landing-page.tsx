"use client";

import { strip } from "@/content/landing";
import { Ticker, Strip } from "@/components/website/Ticker";
import { Nav } from "@/components/website/Nav";
import { Hero } from "@/components/website/Hero";
import { TheGap } from "@/components/website/TheGap";
import { HowItWorks } from "@/components/website/HowItWorks";
import { Spotlight } from "@/components/website/Spotlight";
import { Philosophy } from "@/components/website/Philosophy";
import { Tracks } from "@/components/website/Tracks";
import { Faculty } from "@/components/website/Faculty";
import { Statement } from "@/components/website/Statement";
import { Join } from "@/components/website/Join";
import { Footer } from "@/components/website/Footer";

export function LandingPage() {
  return (
    <>
      <div className="grain" aria-hidden />

      <Ticker />
      <Nav />

      <main id="main">
        <Hero />
        <Strip items={strip} />
        <TheGap />
        <HowItWorks />
        <Spotlight />
        <Philosophy />
        <Tracks />
        <Faculty />
        <Statement />
        <Join />
      </main>

      <Footer />
    </>
  );
}
