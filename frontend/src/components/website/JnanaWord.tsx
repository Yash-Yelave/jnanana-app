"use client";

import { jnanaScripts } from "@/content/landing";
import { ScriptCycle, type ScriptVariant } from "./ScriptCycle";

const SCRIPT_CLASS: Record<string, string> = {
  devanagari: "jnana-devanagari",
  telugu: "jnana-telugu",
  latin: "",
};

const VARIANTS: ScriptVariant[] = jnanaScripts.map((variant) => ({
  lang: variant.lang,
  node: variant.text,
  className: SCRIPT_CLASS[variant.script],
}));

/**
 * "Jnana" in the statement band, cycling continuously through English, Hindi and
 * Telugu, pausing longest on the Sanskrit the brand uses.
 */
export function JnanaWord() {
  return (
    <ScriptCycle variants={VARIANTS} label={jnanaScripts[jnanaScripts.length - 1].text} />
  );
}
