"use client";

import { useEffect, useState } from "react";
import { getProgrammeStats, type ProgrammeStats } from "@/lib/api";
import { Eyebrow, Section, Wrap } from "./ui";
import { Reveal } from "./Reveal";

const REFRESH = 15_000;

/**
 * Digits in clipped slots, keyed by value, so only the digit that actually
 * changed remounts and drops in. Shares the .cd-slot/.cd-digit motion with the
 * hero countdown, so a number moving here reads the same as the clock ticking.
 */
function Odometer({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-hidden>
      {String(value)
        .split("")
        .map((digit, index) => (
          <span key={`${index}-${digit}`} className="cd-slot">
            <span className="cd-digit">{digit}</span>
          </span>
        ))}
    </span>
  );
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-1 flex-col justify-center bg-paper px-7 py-9 text-center sm:py-11">
      <strong
        className="text-amber font-display text-[clamp(44px,6vw,76px)] leading-none font-extrabold tracking-[-0.03em] tabular-nums"
        style={{ WebkitTextStroke: "1.5px var(--color-ink)" }}
      >
        <Odometer value={value} />
        <span className="sr-only">{value}</span>
      </strong>
      <span className="mono mt-4 text-muted">{label}</span>
    </div>
  );
}

const ZERO: ProgrammeStats = { mentors: 0, mentees: 0, mentorship_minutes: 0 };

/**
 * Live programme counters.
 *
 * Every figure is a real count from the database — design system §0.2 forbids
 * invented statistics, so nothing here is seeded or padded. Counters start at
 * zero and climb as people register, which is the point during an event.
 *
 * Rendering zeros from the first paint rather than waiting on the fetch keeps
 * the section from shifting the page when the numbers land; they simply animate
 * up. A failed request keeps whatever is on screen rather than removing the
 * band — a section that appears and then vanishes a moment later reads as
 * broken, and the API being briefly unreachable is not worth that.
 */
export function Numbers() {
  const [stats, setStats] = useState<ProgrammeStats>(ZERO);

  useEffect(() => {
    let active = true;

    const load = () =>
      getProgrammeStats()
        .then((next) => active && setStats(next))
        .catch(() => null);

    load();
    const id = setInterval(load, REFRESH);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const cells = [
    { value: stats.mentors, label: "Mentors registered" },
    { value: stats.mentees, label: "Mentees registered" },
    { value: stats.mentorship_minutes, label: "Minutes donated" },
  ];

  return (
    <Section id="numbers" className="pt-0!">
      <Wrap>
        <Reveal variant="fade-up">
          <Eyebrow className="mb-5.5">The programme so far</Eyebrow>
        </Reveal>

        <Reveal variant="fade-up" delay={80}>
          {/* §4 hairline grid: cells sit on an ink ground with 1.5px gaps, so the
              dividers are the background showing through rather than borders. */}
          <div className="flex flex-col gap-[1.5px] border-[1.5px] border-edge bg-edge shadow-hard-lg sm:flex-row">
            {cells.map((cell) => (
              <Cell key={cell.label} value={cell.value} label={cell.label} />
            ))}
          </div>
        </Reveal>
      </Wrap>
    </Section>
  );
}
