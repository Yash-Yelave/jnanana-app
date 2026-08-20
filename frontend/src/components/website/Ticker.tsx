import { ticker } from "@/content/landing";
import { Marquee } from "./Marquee";

/**
 * Emerald announcement strip, above the nav in the page flow but *below* it in
 * stacking order — at z-60 it painted over the sticky nav as the page scrolled,
 * covering the header and swallowing taps on it.
 */
export function Ticker() {
  return (
    <div className="relative z-10 border-b-2 border-edge bg-emerald">
      <Marquee seconds={34} className="py-2.5" ariaLabel="Announcements">
        {ticker.map((item) => (
          <span key={item} className="flex items-center whitespace-nowrap">
            <span className="mono mx-5 text-paper sm:mx-6.5">{item}</span>
            <span aria-hidden className="mono text-amber">
              ◦
            </span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}

/** Amber rule strip under the hero — the J-Spotlight verbs. */
export function Strip({ items }: { items: readonly string[] }) {
  return (
    <div className="relative z-2 border-y-[1.5px] border-edge bg-amber">
      <Marquee seconds={30} className="py-3" ariaLabel="The J-Spotlight loop">
        {items.map((item) => (
          <span key={item} className="flex items-center whitespace-nowrap">
            <span className="mono mx-5 font-bold text-ink sm:mx-6.5">{item}</span>
            <span aria-hidden className="mono text-ink/50">
              ◦
            </span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
