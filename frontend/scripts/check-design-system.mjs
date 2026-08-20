#!/usr/bin/env node
/**
 * Static conformance check for the Jnanana design system ("Paper & Spotlight").
 *
 * The app and the website drifted into looking like two different products
 * because nothing stopped it. This fails the build on the three things that
 * caused it: colours outside the palette, blurred shadows, and rounded cards.
 *
 * Run: npm run design:check
 */

import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src");

/** §2 — the whole palette, plus plain white which §2.6 allows for cards. */
const PALETTE = new Set(
  [
    "#fbf3e7", // paper
    "#f6ebdb", // paper-2
    "#0b6b44", // emerald
    "#064730", // emerald-deep
    "#08573a", // emerald-lift
    "#d6206a", // magenta
    "#f5b921", // amber
    "#141210", // ink / edge
    "#6a675f", // muted
    "#fff",
    "#ffffff",
    "#b42318", // error — functional, not decorative
    "#ffc107", // star fill in the rating control
  ].map((c) => c.toLowerCase()),
);

const files = globSync("**/*.{ts,tsx,css}", { cwd: SRC })
  .filter((f) => !f.endsWith(".d.ts"))
  .map((f) => join(SRC, f));

const problems = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = file.slice(SRC.length + 1);

  text.split("\n").forEach((line, i) => {
    const at = `${rel}:${i + 1}`;

    // Colours outside the palette.
    for (const hex of line.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) {
      const value = hex.toLowerCase();
      // Not colours: data-URI payloads, 8-digit alpha hexes, HTML entities
      // (§5 mandates &#8209; for the J-Spotlight lockup), and mask stops,
      // where #000 means "opaque" rather than black.
      if (line.includes("data:image") || value.length > 7) continue;
      if (/&#\d+;/.test(line) || /[Mm]ask[Ii]mage|mask-image/.test(line)) continue;
      if (!PALETTE.has(value)) problems.push(`${at}  off-palette colour ${hex}`);
    }

    // §4 — shadows are hard offsets, never blurred.
    const shadow = line.match(/box-?[Ss]hadow:\s*["']?([^;"'}]+)/)?.[1];
    if (shadow && !shadow.includes("inset") && !/^\s*(none|0 0 0)/.test(shadow)) {
      const numbers = shadow.match(/-?\d+(\.\d+)?px/g) ?? [];
      // x, y, blur — a third non-zero value means it is blurred.
      if (numbers.length >= 3 && parseFloat(numbers[2]) !== 0) {
        problems.push(`${at}  blurred shadow: ${shadow.trim()}`);
      }
    }

    // §4 — cards are square. Pills (999px) and avatars (50%) are the exceptions.
    const radius = line.match(/border-?[Rr]adius:\s*["']?([^;"'}]+)/)?.[1]?.trim();
    const isPill = radius && (radius.includes("999") || radius.includes("50%") || radius.includes("99px"));
    if (radius && !/^0/.test(radius) && !isPill) {
      problems.push(`${at}  rounded corner: ${radius}`);
    }
  });
}

if (problems.length > 0) {
  console.error(`\nDesign system: ${problems.length} deviation(s)\n`);
  for (const p of problems.slice(0, 40)) console.error("  " + p);
  if (problems.length > 40) console.error(`  ...and ${problems.length - 40} more`);
  console.error("\nSee design_skill.md §2 (colour) and §4 (form language).\n");
  process.exit(1);
}

console.log(`Design system: clean across ${files.length} files.`);
