import { hero } from "@/content/landing";
import { Button, Chip, Wrap } from "./ui";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

/** The amber light cone behind the headline. Decorative only. */
function Cone() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-[-14%] left-1/2 z-0 h-[130%] w-[min(760px,96vw)] -translate-x-1/2 blur-[2px] motion-safe:animate-[breathe_9s_ease-in-out_infinite]"
      style={{
        background:
          "linear-gradient(180deg,rgba(245,185,33,.42),rgba(245,185,33,.14) 55%,rgba(245,185,33,0))",
        clipPath: "polygon(41% 0,59% 0,100% 100%,0 100%)",
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
      </div>
    </TiltCard>
  );
}

export function Hero() {
  return (
    <header
      id="top"
      className="relative overflow-hidden px-0 pt-14 pb-16 sm:pt-20 md:pt-24 md:pb-21"
    >
      <Cone />

      {/* Desktop: pinned to the corner with smooth levitation float. */}
      <Sticker className="absolute top-[18%] right-[4%] z-3 hidden lg:block" />

      <Wrap className="text-center">
        <Reveal className="mb-7 flex justify-center lg:hidden">
          <Sticker className="rotate-[-2deg]" />
        </Reveal>

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

        <Reveal delay={340} variant="scale-up">
          <p className="it mx-auto mt-5 max-w-[22ch] text-[clamp(20px,2.6vw,30px)] leading-[1.25] text-ink">
            {hero.sub}
          </p>
        </Reveal>

        <Reveal delay={400} variant="fade-up">
          <p className="lead mx-auto mt-6.5 mb-9">{hero.lead}</p>
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
      </Wrap>
    </header>
  );
}

