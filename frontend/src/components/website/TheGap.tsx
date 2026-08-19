import { gaps } from "@/content/landing";
import { Eyebrow, Section, Wrap } from "./ui";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

export function TheGap() {
  return (
    <Section id="gap">
      <Wrap className="grid items-start gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-17">
        <Reveal variant="fade-right">
          <Eyebrow className="mb-5.5">The Gap</Eyebrow>
          <h2 className="text-[clamp(38px,5.6vw,72px)]">
            Talent is
            <br />
            everywhere.
            <br />
            <span className="text-magenta">
              Guidance
              <br />
              is not.
            </span>
          </h2>
        </Reveal>

        <div>
          <Reveal variant="fade-left">
            <p className="lead mb-8">
              There are thousands of people with ideas. But not everyone gets a
              chance to —
            </p>
          </Reveal>

          {gaps.map((g, i) => (
            <Reveal key={g.n} delay={i * 90} variant="fade-left">
              <TiltCard maxTilt={4} className="mb-3.5">
                <div className="group shine-box flex items-center gap-4 border-[1.5px] border-edge bg-white px-5 py-5 shadow-soft transition-all duration-200 hover:translate-x-2.5 hover:shadow-hard sm:gap-4.5 sm:px-6.5">
                  <span className="font-mono text-[11px] font-bold text-amber transition-transform duration-200 group-hover:scale-125">
                    {g.n}
                  </span>
                  <h3 className="text-[clamp(18px,2.4vw,21px)] text-magenta transition-colors duration-200 group-hover:text-emerald">
                    {g.text}
                  </h3>
                </div>
              </TiltCard>
            </Reveal>
          ))}

          <Reveal delay={280} variant="scale-up">
            <div className="shine-box mt-7.5 border-[1.5px] border-edge bg-emerald px-7 py-9 shadow-hard-lg sm:px-10 transition-transform duration-200 hover:scale-[1.01]">
              <p className="font-display text-[clamp(24px,3.2vw,38px)] leading-[1.06] font-bold tracking-[-0.02em] text-paper">
                We believe great ideas{" "}
                <em className="it text-amber">shouldn&apos;t stay hidden.</em>
              </p>
            </div>
          </Reveal>
        </div>
      </Wrap>
    </Section>
  );
}

