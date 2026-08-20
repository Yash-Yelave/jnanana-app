import { hero } from "@/content/landing";
import { Button, Chip, Wrap } from "./ui";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { Countdown } from "./Countdown";

/** The amber light cone behind the headline. Decorative only. */
function Cone() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[-14%] left-1/2 z-0 h-[128%] w-[min(760px,96vw)] -translate-x-1/2 blur-[2px] motion-safe:animate-[breathe_9s_ease-in-out_infinite]"
      style={{
        background:
          "linear-gradient(180deg,rgba(245,185,33,.42),rgba(245,185,33,.15) 40%,rgba(245,185,33,0) 74%)",
        clipPath: "polygon(41% 0,59% 0,100% 100%,0 100%)",
        // The clip leaves hard diagonal edges. Fade the beam to nothing before
        // they reach the copy, so it dissolves as light rather than ending in a
        // visible geometric cut.
        maskImage: "linear-gradient(180deg,#000 0%,#000 34%,transparent 76%)",
        WebkitMaskImage: "linear-gradient(180deg,#000 0%,#000 34%,transparent 76%)",
      }}
    />
  );
}

function Sticker({ className = "" }: { className?: string }) {
  return (
    <TiltCard maxTilt={10} className={className}>
      <div
        className="mono animate-float border-[1.5px] border-edge bg-magenta px-4 py-3 text-center leading-relaxed font-bold text-white shadow-hard transition-transform hover:scale-105 hover:bg-magenta/95 cursor-pointer"
      >
        {hero.sticker.top}
        <b className="block text-[15px] text-amber">{hero.sticker.big}</b>
        {hero.sticker.bottom}
        <Countdown isoStart={hero.sticker.startsAt} />
      </div>
    </TiltCard>
  );
}

export function Hero() {
  return (
    <header
      id="top"
      className="relative overflow-hidden px-0 pt-8 pb-16 sm:pt-10 md:pt-12 md:pb-21"
    >
      <Cone />

      {/* Desktop: pinned to the corner with smooth levitation float. */}
      <Sticker className="absolute top-[18%] right-[4%] z-3 hidden lg:block" />

      <Wrap className="text-center">
        <Reveal variant="fade-down">
          <p className="mono tracking-[0.3em] text-muted">{hero.kicker}</p>
        </Reveal>

        <div className="mt-3.5 mb-2">
          {hero.lines.map((line, i) => (
            <Reveal key={line} delay={60 + i * 90} variant="fade-up">
              <h1 className="text-[clamp(38px,9.6vw,146px)] leading-[0.86] tracking-[-0.045em]">
                <span className={`block ${i === 2 ? "text-magenta" : ""}`}>
                  {line}
                </span>
              </h1>
            </Reveal>
          ))}
        </div>

        <Reveal delay={340} variant="fade-up">
          <p className="lead mx-auto mt-7 mb-9">{hero.lead}</p>
        </Reveal>

        <Reveal delay={460} variant="scale-up">
          <div className="flex flex-col justify-center gap-3.5 sm:flex-row sm:flex-wrap">
            <Button href="/onboarding/student" variant="magenta" className="transition-transform duration-200 hover:scale-[1.03]">
              Join as a Mentee
            </Button>
            <Button href="/onboarding/mentor" className="transition-transform duration-200 hover:scale-[1.03]">
              Become a Mentor
            </Button>
          </div>
        </Reveal>

        <Reveal delay={520} variant="fade-up">
          <div className="mt-9 flex flex-wrap justify-center gap-2.5">
            {hero.chips.map((c) => (
              <Chip key={c.label} tone={c.tone}>
                {c.label}
              </Chip>
            ))}
          </div>
        </Reveal>

        {/* Below the headline on small screens. Above it the sticker pushed the
            positioning line off the first view, and an announcement should not
            outrank the claim it is announcing. (§5 hides this entirely below
            900px; kept here so the countdown still reaches the event audience,
            who are on phones.) */}
        <Reveal delay={580} className="mt-11 flex justify-center lg:hidden">
          <Sticker className="rotate-[-2deg]" />
        </Reveal>
      </Wrap>
    </header>
  );
}

