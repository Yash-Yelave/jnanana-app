import {
  eventDetails,
  noPrereq,
  pass,
  spotlightSteps,
} from "@/content/landing";
import { Button, Chip, Mono, Wrap } from "./ui";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

/** The J-SP(O)TLIGHT lockup — the O is the bulb. */
function SpotlightLogo() {
  return (
    <h2 className="font-display text-[clamp(40px,8.4vw,116px)] leading-[0.9] font-extrabold tracking-[-0.045em] text-paper">
      {/* U+2011 keeps "J-SPOTLIGHT" from breaking at the hyphen */}
      J&#8209;SP
      <span
        aria-hidden
        className="mx-[0.02em] inline-block h-[0.72em] w-[0.72em] -translate-y-[0.02em] rounded-full border-[3px] border-emerald-deep bg-amber align-baseline shadow-[0_0_40px_rgba(245,185,33,.75)] motion-safe:animate-[glow_4s_ease-in-out_infinite] transition-transform duration-300 hover:scale-125"
      />
      <span className="sr-only">O</span>
      TLIGHT<span className="text-magenta">.</span>
    </h2>
  );
}

export function Spotlight() {
  return (
    <section
      id="spotlight"
      className="relative z-2 overflow-hidden border-y-2 border-edge bg-emerald-deep py-[clamp(64px,8.5vw,120px)]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(251,243,231,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(251,243,231,.05) 1px,transparent 1px)",
        backgroundSize: "38px 38px",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-10%] left-1/2 h-[120%] w-[min(700px,92vw)] -translate-x-1/2 blur-[3px] motion-safe:animate-[breathe_11s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(180deg,rgba(245,185,33,.3),rgba(245,185,33,.06) 60%,transparent)",
          clipPath: "polygon(43% 0,57% 0,100% 100%,0 100%)",
        }}
      />

      <Wrap className="text-center">
        <Reveal variant="fade-down">
          {/* Wider tracking than a standard mono label — this one is a title card. */}
          <Mono className="mb-5 tracking-[0.3em] text-paper/60">
            A Monthly Spotlight Series
          </Mono>
        </Reveal>

        <Reveal delay={60} variant="scale-up">
          <SpotlightLogo />
        </Reveal>

        <Reveal delay={140} variant="scale-up">
          <p className="mt-4 inline-block -rotate-[1.4deg] border-[1.5px] border-edge bg-magenta px-5.5 py-1.5 font-display text-[clamp(15px,2.1vw,26px)] font-extrabold tracking-[-0.01em] text-white transition-transform duration-300 hover:rotate-0 hover:scale-105 cursor-pointer">
            Finding The Next Junicorn
          </p>
        </Reveal>

        <Reveal delay={200} variant="fade-up">
          <p className="lead mx-auto mt-7.5 text-paper/72">
            A monthly gathering where ideas, people and possibility come
            together. You bring the idea — we bring the spotlight.
          </p>
        </Reveal>

        {/* Four beats of the evening */}
        <div className="mt-14 grid gap-[1.5px] border-[1.5px] border-paper/22 bg-paper/22 sm:grid-cols-2 lg:grid-cols-4">
          {spotlightSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80} variant="scale-up" className="h-full">
              <div className="group h-full bg-emerald-deep px-6 pt-8 pb-9 text-left transition-all duration-300 hover:bg-emerald-lift sm:px-6.5">
                <span className="inline-block font-mono text-[11px] font-bold tracking-[0.2em] text-amber transition-transform duration-200 group-hover:scale-110">
                  {s.n}
                </span>
                <h3
                  className={`mt-4 mb-2.5 text-[clamp(20px,2.6vw,23px)] transition-colors duration-200 ${
                    i % 2 === 1 ? "text-amber group-hover:text-paper" : "text-paper group-hover:text-amber"
                  }`}
                >
                  {s.title}
                </h3>
                <p className="text-[14.5px] text-paper/68">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Who it's for */}
        <div className="mt-17">
          <Reveal variant="fade-up">
            <Mono className="mb-4 tracking-[0.26em] text-magenta">
              No Prerequisites
            </Mono>
            <h3 className="text-[clamp(30px,5.6vw,72px)] text-paper">
              You don&apos;t need a startup.
              <br />
              <span className="text-amber">
                You just need something worth sharing.
              </span>
            </h3>
          </Reveal>

          <Reveal delay={120} variant="scale-up">
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {noPrereq.map((c) => (
                <Chip key={c.label} tone={c.hot ? "hot" : "onDark"}>
                  {c.label}
                </Chip>
              ))}
            </div>
            <p className="it mt-6.5 text-[clamp(19px,2.4vw,22px)] text-amber">
              If that sounds like you, J-Spotlight is for you.
            </p>
          </Reveal>
        </div>

        {/* Edition 01 details */}
        <Reveal delay={80} variant="fade-up">
          <dl className="mt-14 grid gap-px border-[1.5px] border-amber bg-amber/30 text-left sm:grid-cols-2 lg:grid-cols-3">
            {eventDetails.map((e) => (
              <div key={e.k} className="bg-emerald-deep px-6 py-7 sm:px-6.5 transition-colors duration-200 hover:bg-emerald-lift">
                <dt className="mb-2 font-mono text-[10px] tracking-[0.2em] text-amber uppercase">
                  {e.k}
                </dt>
                <dd>
                  <span className="block font-display text-[clamp(18px,2.2vw,20px)] leading-[1.15] font-bold text-paper">
                    {e.v}
                  </span>
                  <span className="mt-1 block text-[13px] text-paper/60">
                    {e.s}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={140} variant="scale-up">
          <div className="mt-9 text-center">
            <TiltCard maxTilt={5} className="inline-block">
              <div className="inline-block border-2 border-dashed border-amber px-10 py-4.5 sm:px-11.5 transition-all duration-300 hover:bg-amber/10 hover:border-solid">
                <p className="font-display text-[clamp(34px,5vw,44px)] leading-none font-extrabold text-amber">
                  {pass.amount}
                </p>
                <p className="mt-1.5 font-mono text-[10px] tracking-[0.24em] text-paper/70 uppercase">
                  {pass.label}
                </p>
              </div>
            </TiltCard>

            <p className="mono mx-auto my-6.5 max-w-[36ch] text-amber">
              {pass.note}
            </p>

            <Button href="#join" variant="amber" className="transition-transform duration-200 hover:scale-105">
              {pass.cta}
            </Button>
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}

