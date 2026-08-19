import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { TiltCard } from "./TiltCard";

/* ---------------------------------------------------------- */
/* Wordmark                                                    */
/* ---------------------------------------------------------- */

export function Wordmark({
  className = "",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={`font-display text-[20px] font-extrabold tracking-[0.14em] ${
        onDark ? "text-paper" : "text-emerald"
      } ${className}`}
    >
      J<span className="border-b-2 border-magenta">Ṉ</span>ANANA
    </span>
  );
}

/* ---------------------------------------------------------- */
/* Buttons                                                     */
/* ---------------------------------------------------------- */

type ButtonVariant = "emerald" | "magenta" | "amber" | "ghost" | "onDark";

const buttonVariant: Record<ButtonVariant, string> = {
  emerald: "",
  magenta: "btn--magenta",
  amber: "btn--amber",
  ghost: "btn--ghost",
  onDark: "btn--on-dark",
};

export function Button({
  href,
  children,
  variant = "emerald",
  size,
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm";
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={`btn ${buttonVariant[variant]} ${size === "sm" ? "btn--sm" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------- */
/* Chips                                                       */
/* ---------------------------------------------------------- */

type ChipTone = "plain" | "magenta" | "emerald" | "onDark" | "hot";

const chipTone: Record<ChipTone, string> = {
  plain: "",
  magenta: "chip--magenta",
  emerald: "chip--emerald",
  onDark: "chip--on-dark",
  hot: "chip--hot",
};

export function Chip({
  children,
  tone = "plain",
}: {
  children: ReactNode;
  tone?: ChipTone;
}) {
  return <span className={`chip ${chipTone[tone]}`}>{children}</span>;
}

/* ---------------------------------------------------------- */
/* Labels                                                      */
/* ---------------------------------------------------------- */

export function Eyebrow({
  children,
  center = false,
  className = "",
}: {
  children: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <p className={`eyebrow ${center ? "eyebrow--center" : ""} ${className}`}>
      {children}
    </p>
  );
}

/** Bare mono label — no leading rule. Used where the eyebrow rule is too much. */
export function Mono({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`mono ${className}`}>{children}</p>;
}

/* ---------------------------------------------------------- */
/* Layout                                                      */
/* ---------------------------------------------------------- */

export function Section({
  children,
  className = "",
  ...rest
}: ComponentProps<"section">) {
  return (
    <section className={`section ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function Wrap({ children, className = "", ...rest }: ComponentProps<"div">) {
  return (
    <div className={`wrap ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* Feature card — the paired "For Mentors / For Mentees" block */
/* ---------------------------------------------------------- */

export function FeatureCard({
  eyebrow,
  title,
  body,
  points,
  dark = false,
}: {
  eyebrow: string;
  title: string[];
  body: string;
  points: string[];
  dark?: boolean;
}) {
  return (
    <TiltCard className="h-full">
      <article
        className={`group lift shine-box flex h-full flex-col border-[1.5px] border-edge p-8 shadow-hard-lg sm:p-9 md:px-9 md:py-10 ${
          dark ? "bg-emerald" : "bg-white"
        }`}
      >
        <p className={`eyebrow mb-3.5 ${dark ? "text-amber" : ""}`}>
          {eyebrow}
        </p>

        <h3 className={`text-[clamp(21px,2.6vw,26px)] ${dark ? "text-paper" : ""}`}>
          {title.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h3>

        <p
          className={`mt-3 mb-6 text-[15.5px] sm:text-base ${
            dark ? "text-paper/80" : "text-muted"
          }`}
        >
          {body}
        </p>

        <ul className="mt-auto">
          {points.map((p) => (
            <li
              key={p}
              className={`flex gap-3 border-t py-3 text-[15px] sm:text-[15.5px] transition-colors ${
                dark
                  ? "border-paper/20 text-paper/86 group-hover:text-paper"
                  : "border-ink/12 text-ink group-hover:text-emerald"
              }`}
            >
              <span
                aria-hidden
                className={`font-mono transition-transform duration-200 group-hover:translate-x-1.5 ${
                  dark ? "text-amber" : "text-magenta"
                }`}
              >
                →
              </span>
              {p}
            </li>
          ))}
        </ul>
      </article>
    </TiltCard>
  );
}

