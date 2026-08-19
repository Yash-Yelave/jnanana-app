import { statement } from "@/content/landing";
import { Wrap } from "./ui";
import { Reveal } from "./Reveal";

/** The one magenta band on the page. */
export function Statement() {
  return (
    <section className="relative z-2 border-y-2 border-edge bg-magenta py-[clamp(72px,9vw,120px)] text-center overflow-hidden">
      <Wrap>
        <blockquote className="it text-[clamp(30px,6vw,84px)] leading-[1.02] tracking-[-0.02em] text-white">
          {statement.quote.map((line, i) => (
            <Reveal key={line} delay={i * 120} variant="scale-up">
              <span className="block transition-transform duration-300 hover:scale-[1.02] cursor-default">
                {line}
              </span>
            </Reveal>
          ))}
        </blockquote>

        <Reveal delay={360} variant="fade-up">
          <p className="mono mt-8 tracking-[0.26em] text-white/75">
            {statement.who}
          </p>
        </Reveal>
      </Wrap>
    </section>
  );
}

