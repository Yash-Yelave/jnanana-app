import { Button, Mono, Wrap } from "./ui";
import { Reveal } from "./Reveal";

export function Join() {
  return (
    <section
      id="join"
      className="relative z-2 overflow-hidden border-b-2 border-edge bg-emerald py-[clamp(64px,8.5vw,110px)] text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-20%] left-1/2 h-[140%] w-[min(800px,96vw)] -translate-x-1/2 blur-[4px] motion-safe:animate-[breathe_10s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle, rgba(245,185,33,0.25) 0%, rgba(11,107,68,0) 70%)",
        }}
      />

      <Wrap className="relative z-2">
        <Reveal variant="fade-down">
          <Mono className="mb-4.5 tracking-[0.3em] text-amber">
            Step Into The Light
          </Mono>
          <h2 className="text-[clamp(34px,6vw,84px)] text-paper">
            Your experience is
            <br />
            someone&apos;s <em className="it text-amber">turning point.</em>
          </h2>
        </Reveal>

        <Reveal delay={120} variant="scale-up">
          <p className="lead mx-auto mt-5.5 mb-10 text-paper/75">
            Mentorship at Jṉanana is curated on both sides. Tell us who you are
            — we&apos;ll place you where the guidance lands hardest.
          </p>

          <div className="flex flex-col justify-center gap-3.5 sm:flex-row sm:flex-wrap">
            <Button href="/onboarding/mentor" variant="amber" className="transition-transform duration-200 hover:scale-105">
              Apply as a Mentor
            </Button>
            <Button href="/onboarding/student" variant="magenta" className="transition-transform duration-200 hover:scale-105">
              Apply as a Mentee
            </Button>
            <Button href="#spotlight" variant="onDark" className="transition-transform duration-200 hover:scale-105">
              Book J-Spotlight
            </Button>
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}

