import { domains, faculty } from "@/content/landing";
import { Eyebrow, Section, Wrap } from "./ui";
import { Marquee } from "./Marquee";
import { Reveal } from "./Reveal";

export function Faculty() {
  return (
    <Section id="faculty" className="pt-0!">
      <Wrap className="text-center">
        <Reveal variant="fade-down">
          <Eyebrow center className="mb-5.5">
            The Faculty
          </Eyebrow>
          <h2 className="text-[clamp(38px,5.6vw,72px)]">
            Mentors who have
            <br />
            <span className="text-magenta">actually built it.</span>
          </h2>
          <p className="lead mx-auto mt-5">
            Founders, operators, investors, engineers and educators — admitted
            for what they&apos;ve shipped, not what they&apos;ve posted.
          </p>
        </Reveal>
      </Wrap>

      <Marquee
        seconds={44}
        ariaLabel="Jṉanana faculty"
        className="relative z-2 mt-11 border-y-[1.5px] border-edge bg-white py-5.5"
      >
        {faculty.map((m, i) => (
          <span
            key={`${m.initials}-${i}`}
            className="group mx-2.5 inline-flex items-center gap-3 border-[1.5px] border-edge bg-paper py-2.5 pr-5.5 pl-2.5 whitespace-nowrap transition-transform duration-200 hover:-translate-y-1 hover:shadow-hard-sm cursor-pointer"
          >
            <span
              aria-hidden
              className="inline-flex h-9.5 w-9.5 shrink-0 items-center justify-center border-[1.5px] border-edge bg-emerald font-display text-sm font-extrabold text-amber transition-transform duration-200 group-hover:scale-110"
            >
              {m.initials}
            </span>
            <span className="text-left">
              <span className="block text-[14.5px] leading-tight font-bold transition-colors duration-200 group-hover:text-magenta">
                {m.name}
              </span>
              <span className="block font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
                {m.role}
              </span>
            </span>
          </span>
        ))}
      </Marquee>

      <Wrap>
        <div className="mt-12 grid gap-[1.5px] border-[1.5px] border-edge bg-edge sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d, i) => (
            <Reveal key={d.title} delay={(i % 3) * 80} variant="scale-up" className="h-full">
              <div className="group h-full bg-paper px-6 py-6.5 transition-all duration-300 hover:bg-amber cursor-pointer">
                <h3 className="mb-1.5 text-[clamp(17px,2.2vw,19px)] transition-colors duration-200 group-hover:text-ink">
                  {d.title}
                </h3>
                <p className="text-sm text-muted transition-colors duration-200 group-hover:text-ink/80">{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}

