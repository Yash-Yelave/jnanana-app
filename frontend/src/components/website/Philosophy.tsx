import { Fragment } from "react";
import { chain } from "@/content/landing";
import { Eyebrow, Section, Wrap } from "./ui";
import { Reveal } from "./Reveal";

/**
 * Idea → Conversation → Mentor → Momentum → Impact.
 * Runs as a horizontal chain on desktop and turns vertical on phones, where
 * a wrapped row of arrows reads as noise.
 */
function Chain() {
  return (
    <ol className="my-9 flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap md:my-11">
      {chain.map((node, i) => {
        const last = i === chain.length - 1;
        return (
          <Fragment key={node}>
            <Reveal delay={i * 90} variant="scale-up" as="li" className="text-center group cursor-pointer">
              <span
                aria-hidden
                className={`mx-auto mb-2.5 block h-4.5 w-4.5 rounded-full border-[1.5px] border-edge transition-transform duration-300 group-hover:scale-138 ${
                  last ? "bg-magenta shadow-[0_0_12px_rgba(214,32,106,0.6)]" : "bg-amber group-hover:bg-magenta"
                }`}
              />
              <span
                className={`font-mono text-[10.5px] font-bold tracking-[0.16em] uppercase transition-colors duration-200 ${
                  last ? "text-magenta" : "text-emerald group-hover:text-magenta"
                }`}
              >
                {node}
              </span>
            </Reveal>
            {!last && (
              <Reveal delay={i * 90 + 45} variant="fade-up" as="li" aria-hidden className="my-2 font-mono text-sm text-amber sm:mx-3 sm:my-0 sm:mb-5.5">
                <span className="sm:hidden inline-block transition-transform duration-200 hover:translate-y-1">↓</span>
                <span className="hidden sm:inline-block transition-transform duration-200 hover:translate-x-1.5">→</span>
              </Reveal>
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

export function Philosophy() {
  return (
    <Section>
      <Wrap className="text-center">
        <Reveal variant="fade-down">
          <Eyebrow center className="mb-5.5">
            The Philosophy
          </Eyebrow>
          <h2 className="text-[clamp(38px,5.6vw,72px)]">
            Every <span className="text-magenta">Junicorn</span> starts
            somewhere.
          </h2>
        </Reveal>

        <Chain />

        <Reveal delay={180} variant="scale-up">
          <p className="it mx-auto max-w-[26ch] text-[clamp(22px,3vw,34px)] leading-[1.35] text-ink">
            It could start with an idea. A problem. A conversation.{" "}
            <span className="text-magenta">
              A mentor. A room full of the right people.
            </span>
          </p>
          <p className="lead mx-auto mt-6.5">
            Jṉanana is about finding those people early, and giving them
            somewhere to grow.
          </p>
        </Reveal>
      </Wrap>
    </Section>
  );
}

