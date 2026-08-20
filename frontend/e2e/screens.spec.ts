import { test, expect, type Page } from "@playwright/test";

/**
 * Every screen, not just the landing page.
 *
 * `responsive.spec.ts` covers `/` in depth across seven widths. This covers the
 * breadth: each route that renders without a session, checked for the defects
 * that actually shipped — content wider than the viewport, type below the
 * readability floor, and touch targets too small to hit.
 *
 * Routes behind the session (`/dashboard`, `/mentors`, `/admin`, `/profile`,
 * and the mentor screens) redirect to `/login`, so they cannot be reached here.
 * They all render inside `AppShell`, which `/events` exercises in full.
 */
const ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/events",
  "/onboarding/student",
  "/onboarding/mentor",
  "/waiting",
];

/** Narrowest phone, common phone, tablet, and laptop. */
const WIDTHS = [320, 390, 768, 1440];

/** Next/Image reserves no box until it decodes, so anything measuring an
 *  avatar before then reads it as a 2x2 collapsed link. Wait for images —
 *  but only those in view: a lazy image below the fold never loads at all, so
 *  waiting on it unconditionally hangs until the test times out. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    const inView = [...document.images].filter((img) => {
      if (img.complete) return false;
      const box = img.getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    });
    await Promise.all(
      inView.map(
        (img) =>
          new Promise((resolve) => {
            img.onload = img.onerror = resolve;
            setTimeout(resolve, 3000);
          }),
      ),
    );
  });
  await page.waitForTimeout(250);
}

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    test(`${route} has no horizontal overflow at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(route);
      await settle(page);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        scrollWidth,
        `${route} is ${scrollWidth - clientWidth}px wider than a ${width}px viewport`,
      ).toBeLessThanOrEqual(clientWidth + 1);
    });
  }

  test(`${route} has no unreadable type at 320`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(route);
    await settle(page);

    const tooSmall = await page.evaluate(() => {
      const found = new Set<string>();
      for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
        if (el.children.length > 0 || !el.textContent?.trim()) continue;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const size = parseFloat(style.fontSize);
        // Mono labels sit at 10-11px by design. Below 10px is a bug.
        if (size > 0 && size < 10) {
          found.add(`${el.tagName.toLowerCase()}[${String(el.className).slice(0, 30)}] @ ${size}px`);
        }
      }
      return [...found].slice(0, 8);
    });

    expect(tooSmall, `type below 10px on ${route}:\n${tooSmall.join("\n")}`).toEqual([]);
  });
}

/**
 * The mobile bottom bar is shared by every authenticated screen, so a defect
 * here is a defect everywhere. "My Requests" used to wrap onto a second line,
 * leaving that one item 15px taller than its four neighbours.
 */
test.describe("app shell bottom navigation", () => {
  for (const width of [320, 360, 390, 414]) {
    test(`bottom nav is uniform and reachable at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/events");
      await settle(page);

      const items = await page.evaluate(() => {
        const nav = document.querySelector("nav[aria-label='Mobile bottom navigation']");
        if (!nav) return null;
        return [...nav.querySelectorAll("a")].map((a) => {
          const span = a.querySelector("span")!;
          const box = a.getBoundingClientRect();
          return {
            text: span.textContent ?? "",
            width: box.width,
            height: box.height,
            right: box.right,
            lines: Math.round(
              span.getBoundingClientRect().height / parseFloat(getComputedStyle(span).lineHeight),
            ),
          };
        });
      });

      expect(items, "bottom nav did not render").not.toBeNull();
      expect(items!.length).toBe(5);

      for (const item of items!) {
        expect(item.lines, `"${item.text}" wraps onto ${item.lines} lines`).toBe(1);
        // WCAG 2.5.8 target size, which the 46px min-height is set to clear.
        expect(item.height, `"${item.text}" is only ${item.height}px tall`).toBeGreaterThanOrEqual(44);
        expect(item.right, `"${item.text}" extends past the viewport`).toBeLessThanOrEqual(width + 1);
      }

      // One ragged item is the visible symptom; equal heights is the invariant.
      const heights = new Set(items!.map((i) => Math.round(i.height)));
      expect(heights.size, `bottom nav items have mismatched heights: ${[...heights].join(", ")}`).toBe(1);
    });
  }

  test("mobile header fits without overflowing at 320", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/events");
    await settle(page);

    const overflow = await page.evaluate(() => {
      const header = document.querySelector("header");
      return header ? header.scrollWidth - header.clientWidth : -1;
    });

    expect(overflow, `mobile header content is ${overflow}px too wide`).toBeLessThanOrEqual(1);
  });
});

/**
 * A dead backend must not put the browser's own vocabulary on screen.
 *
 * Every catch block used to read `err instanceof Error ? err.message : "..."`.
 * That looks like it falls back to the friendly sentence, but a failed fetch
 * rejects with a TypeError — which *is* an Error — so the fallback never ran
 * and users saw "Failed to fetch". The request is aborted here rather than
 * relying on the API being down, so the check holds wherever it runs.
 */
test("a failed API call shows a human message, not the browser's", async ({ page }) => {
  await page.route("**/events**", (route) =>
    route.request().url().includes(":8000") ? route.abort("failed") : route.continue(),
  );
  await page.route("http://127.0.0.1:8000/**", (route) => route.abort("failed"));

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/events");
  await page.waitForTimeout(1500);

  const body = await page.evaluate(() => document.body.innerText);

  // The exact wording differs per browser; none of it belongs in the UI.
  for (const leak of ["Failed to fetch", "Load failed", "NetworkError", "TypeError", "[object "]) {
    expect(body, `"${leak}" reached the screen`).not.toContain(leak);
  }
  await expect(page.getByText(/couldn't reach Jnanana/i)).toBeVisible();
});
