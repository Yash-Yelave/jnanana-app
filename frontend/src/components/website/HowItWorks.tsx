import { forMentees, forMentors, steps } from "@/content/landing";
import { Eyebrow, FeatureCard, Section, Wrap } from "./ui";
import { Reveal } from "./Reveal";

export function HowItWorks() {
  return (
    <Section id="how" className="pt-0!">
      <Wrap>
        <Reveal variant="fade-up">
          <Eyebrow className="mb-5.5">How Mentorship Runs Here</Eyebrow>
          <h2 className="mb-5 text-[clamp(38px,5.6vw,72px)]">
            Matched with intent.
            <br />
            <span className="text-magenta">Measured to the hour.</span>
          </h2>
          <p className="lead">
            No cold directories. No unanswered messages. Every pairing is
            deliberate, and every track is accountable to an outcome you set at
            the start.
          </p>
        </Reveal>

        {/* Hairline gaps over an ink backdrop make the 1.5px rules read as one grid. */}
        <div className="mt-11 grid gap-[1.5px] border-[1.5px] border-edge bg-edge shadow-soft-lg sm:grid-cols-2 lg:mt-13.5 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80} variant="scale-up" className="h-full">
              <div className="group relative h-full bg-paper px-6 pt-8 pb-9 transition-all duration-300 hover:bg-white sm:px-6.5 overflow-hidden">
                {/* Top border accent line that expands on hover */}
                <div className="absolute top-0 left-0 h-1 w-0 bg-magenta transition-all duration-300 ease-out group-hover:w-full" />
                
                <span className="inline-block font-mono text-[11px] font-bold tracking-[0.2em] text-magenta transition-transform duration-200 group-hover:scale-110">
                  {s.n}
                </span>
                <h3 className="mt-4 mb-2.5 text-[clamp(21px,2.6vw,24px)] transition-colors duration-200 group-hover:text-emerald">
                  {s.title}
                </h3>
                <p className="text-[15px] text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6.5 grid gap-6.5 lg:grid-cols-2">
          <Reveal variant="fade-right" className="h-full">
            <FeatureCard {...forMentors} />
          </Reveal>
          <Reveal delay={120} variant="fade-left" className="h-full">
            <FeatureCard {...forMentees} dark />
          </Reveal>
        </div>
      </Wrap>
    </Section>
  );
}

