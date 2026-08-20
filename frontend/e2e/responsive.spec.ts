import { test, expect, type Page } from "@playwright/test";

/**
 * The widths that actually matter, including both sides of the `lg` boundary
 * where the nav swaps between the drawer and the full link row. Layout bugs
 * cluster at breakpoints, so 1023/1024 are tested as a pair.
 */
const WIDTHS = [
  { name: "320 — smallest phone", width: 320, height: 720 },
  { name: "390 — iPhone", width: 390, height: 844 },
  { name: "414 — large phone", width: 414, height: 896 },
  { name: "768 — tablet portrait", width: 768, height: 1024 },
  { name: "1023 — just below lg", width: 1023, height: 800 },
  { name: "1024 — lg boundary", width: 1024, height: 800 },
  { name: "1440 — laptop", width: 1440, height: 900 },
];

/**
 * Scroll the whole page so every reveal fires, then wait for them to settle.
 *
 * The `fade-left`/`fade-right` reveals hold their element 36px to the side until
 * they trigger, so measuring mid-flight reports overflow that is not real. This
 * waits until nothing is still queued.
 */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    window.scrollTo(0, 0);

    // Every reveal that armed itself must have fired.
    const deadline = Date.now() + 6000;
    while (Date.now() < deadline) {
      const pending = document.querySelectorAll(".will-reveal:not(.is-in)").length;
      if (pending === 0) break;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    // ...and their 0.65s transition has to land.
    await new Promise((resolve) => setTimeout(resolve, 1200));
  });
}

for (const { name, width, height } of WIDTHS) {
  test(`no horizontal overflow at ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await scrollThrough(page);

    // `body { overflow-x: hidden }` hides a horizontal scrollbar, so measure the
    // documentElement instead — it still reports the real content width.
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth, `content is ${scrollWidth - clientWidth}px wider than the viewport`).toBeLessThanOrEqual(
      clientWidth + 1, // sub-pixel rounding
    );
  });

  test(`nothing spills past the viewport at ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await scrollThrough(page);

    // Name the specific offenders rather than just failing on the page total.
    const spills = await page.evaluate((viewport) => {
      /** Marquee tracks are wider than the screen on purpose and are clipped by
       *  an ancestor. Only content that actually escapes to the page counts. */
      const isClipped = (el: HTMLElement) => {
        // Stop at <body>: it carries `overflow-x: hidden` sitewide, which would
        // otherwise mark every element on the page as legitimately clipped.
        let node: HTMLElement | null = el.parentElement;
        while (node && node !== document.body && node !== document.documentElement) {
          const { overflowX } = getComputedStyle(node);
          if (overflowX !== "visible") return true;
          node = node.parentElement;
        }
        return false;
      };

      const bad: string[] = [];
      for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
        const style = getComputedStyle(el);
        if (style.position === "fixed" || style.display === "none" || style.visibility === "hidden") continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0) continue;
        if (box.right > viewport + 1 || box.left < -1) {
          if (isClipped(el)) continue;
          bad.push(
            `${el.tagName.toLowerCase()} [${String(el.className).slice(0, 55)}] ` +
              `left=${Math.round(box.left)} right=${Math.round(box.right)} ` +
              `transform=${style.transform} translate=${style.translate}`,
          );
        }
      }
      return bad.slice(0, 8);
    }, width);

    expect(spills, `elements extend past the viewport:\n${spills.join("\n")}`).toEqual([]);
  });
}

test("no unreadable type at the narrowest width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");

  const tooSmall = await page.evaluate(() => {
    const found: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("p, li, a, span, h1, h2, h3"))) {
      if (!el.textContent?.trim()) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      // Mono labels are set at 10-11px by design; anything under 10 is a bug.
      if (size > 0 && size < 10) found.push(`${el.tagName.toLowerCase()} @ ${size}px`);
    }
    return [...new Set(found)].slice(0, 8);
  });

  expect(tooSmall, `type below 10px:\n${tooSmall.join("\n")}`).toEqual([]);
});
