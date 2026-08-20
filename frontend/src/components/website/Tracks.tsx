import { isfPartner, isfWhy, tracks, type RichText } from "@/content/landing";
import { Eyebrow, FeatureCard, Section, Wrap } from "./ui";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

function Rich({ text }: { text: RichText }) {
  if (typeof text === "string") return <>{text}</>;
  return (
    <>
      {text.map((run, i) =>
        typeof run === "string" ? (
          <span key={i}>{run}</span>
        ) : (
          <strong key={i} className="font-bold text-ink">
            {run.strong}
          </strong>
        ),
      )}
    </>
  );
}

export function Tracks() {
  return (
    <Section id="tracks" className="pt-0!">
      <Wrap>
        <Reveal variant="fade-up">
          <Eyebrow className="mb-5.5">Mentorship Tracks</Eyebrow>
          <h2 className="mb-5 text-[clamp(38px,5.6vw,72px)]">
            Choose the depth
            <br />
            <span className="text-magenta">you&apos;re ready for.</span>
          </h2>
          <p className="lead">
            Every mentee enters through a track. Each has its own rhythm,
            duration and outcome.
          </p>
        </Reveal>

        <div className="mt-11 grid gap-6.5 lg:mt-13.5 lg:grid-cols-3">
          {tracks.map((t, i) => (
            <Reveal key={t.title} delay={i * 100} variant="scale-up" className="h-full">
              <TiltCard maxTilt={5} className="h-full">
                <article className="lift shine-box group flex h-full flex-col border-[1.5px] border-edge bg-white p-8 shadow-hard-lg sm:px-7.5 sm:py-8.5 transition-all duration-300">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-magenta uppercase">
                    {t.tag}
                  </span>

                  <h3 className="mt-4 mb-1.5 text-[clamp(24px,3vw,28px)] transition-colors duration-200 group-hover:text-emerald">
                    {t.title}
                    {t.pin && (
                      <span className="animate-wiggle ml-2 inline-block border-[1.5px] border-edge bg-amber px-2.5 py-0.5 align-middle font-mono text-[10px] font-bold tracking-[0.14em] text-ink uppercase shadow-hard-sm">
                        {t.pin}
                      </span>
                    )}
                  </h3>

                  <p className="it mb-3.5 text-[18px] text-amber">{t.kick}</p>

                  <p className="flex-1 text-[15px] text-muted">
                    <Rich text={t.body} />
                  </p>

                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-6.5 grid gap-6.5 lg:grid-cols-2">
          <Reveal variant="fade-right" className="h-full">
            <FeatureCard {...isfPartner} dark />
          </Reveal>
          <Reveal delay={120} variant="fade-left" className="h-full">
            <FeatureCard {...isfWhy} />
          </Reveal>
        </div>
      </Wrap>
    </Section>
  );
}

