import Link from "next/link";
import { footerColumns, statement } from "@/content/landing";
import { Wordmark, Wrap } from "./ui";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="relative z-2 bg-paper-2 pt-19 pb-8.5">
      <Wrap>
        <div className="mb-12 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-11">
          <Reveal variant="fade-up" className="col-span-2 lg:col-span-1">
            <div>
              <Link href="#top" aria-label="Jṉanana — back to top" className="inline-block transition-transform duration-200 hover:scale-105">
                <Wordmark />
              </Link>
              <p className="mt-3.5 max-w-[32ch] text-[15px] text-muted">
                The World&apos;s Largest Mentorship Program. Pairing those who
                have built with those who are building.
              </p>
            </div>
          </Reveal>

          {footerColumns.map((col, i) => (
            <Reveal key={col.title} delay={i * 80} variant="fade-up">
              <nav aria-label={col.title}>
                <h2 className="mb-4 font-mono text-[10px] font-medium tracking-[0.22em] text-magenta uppercase">
                  {col.title}
                </h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        {...("external" in l && l.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="inline-block py-1.5 text-[14.5px] break-words text-ink transition-all duration-200 hover:translate-x-1.5 hover:text-magenta"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} variant="scale-up">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t-[1.5px] border-edge pt-6">
            <p className="font-mono text-[10.5px] tracking-[0.12em] text-muted uppercase">
              © 2026 Jṉanana Foundation × ISF
            </p>
            <p className="it text-[15px] text-emerald">
              {statement.quote.join(" ")}
            </p>
          </div>
        </Reveal>
      </Wrap>
    </footer>
  );
}

