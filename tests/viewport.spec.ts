import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Target = { name: string; url: string };

const productionQa = process.env.CACTUSBYTE_PRODUCTION_QA === "1";
const viewports = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 12", width: 390, height: 844 },
  { name: "Pixel 5", width: 393, height: 851 },
  { name: "iPad Mini", width: 768, height: 1024 },
  { name: "Fold/Tablet Wide", width: 1024, height: 768 },
];

const targets: Target[] = productionQa
  ? JSON.parse(readFileSync(resolve("qa/production-targets.json"), "utf8"))
  : [{ name: "CactusByte Studios local", url: "/" }];

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const target of targets) {
      test(`${target.name} stays usable`, async ({ page }) => {
        const pageErrors: string[] = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));

        const response = await page.goto(target.url, { waitUntil: "domcontentloaded" });
        expect(response, `${target.name} did not return a document response`).not.toBeNull();
        expect(response!.status(), `${target.name} returned an HTTP server error`).toBeLessThan(500);

        await page.waitForTimeout(600);
        await expect(page.locator("body")).toBeVisible();

        const audit = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const overflow = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0) - window.innerWidth;

          const visible = (element: Element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
          };

          const undersizedControls = Array.from(
            document.querySelectorAll("button,[role='button'],input[type='button'],input[type='submit']"),
          )
            .filter(visible)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return { text: (element.textContent || (element as HTMLInputElement).value || "control").trim().slice(0, 80), width: rect.width, height: rect.height };
            })
            .filter((control) => control.width < 40 || control.height < 40);

          const clippedDialogs = Array.from(document.querySelectorAll("dialog,[role='dialog'],.modal"))
            .filter(visible)
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
            })
            .filter((rect) => rect.left < -4 || rect.top < -4 || rect.right > window.innerWidth + 4 || rect.bottom > window.innerHeight + 4);

          return { overflow, undersizedControls, clippedDialogs };
        });

        expect(audit.overflow, `${target.name} horizontally overflows by ${audit.overflow}px`).toBeLessThanOrEqual(2);
        expect(audit.clippedDialogs, `${target.name} has a clipped visible dialog`).toEqual([]);
        expect(audit.undersizedControls, `${target.name} has visible tap controls below 40px`).toEqual([]);
        expect(pageErrors, `${target.name} emitted uncaught page errors`).toEqual([]);
      });
    }
  });
}
