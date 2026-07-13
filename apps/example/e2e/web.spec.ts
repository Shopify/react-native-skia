import * as fs from "fs";
import * as path from "path";

import { test, expect } from "playwright/test";

import { apiScreenPaths } from "../src/Examples/API/linking";

type Screen = keyof typeof apiScreenPaths;

const screenshotsDir = path.join(__dirname, "screenshots");

// Smoke test: every API example screen must load on web without an uncaught
// exception and render at least one canvas. Screenshots are saved as CI
// artifacts for visual inspection — they are not compared against golden
// images since most examples are animated and rendering is not deterministic
// across GPUs.

// Screens that are currently broken on web — each entry is a TODO.
const skip: Partial<Record<Screen, string>> = {
  PathEffect: "PathEffectFactory.MakeCompose is not implemented on web",
  ImageFilters: "uses image filter APIs not implemented on web",
  FontMgr: "uses font manager APIs not implemented on web",
  ColorFilter: "throws 'invalid color matrix' on web",
  Path: "PathFactory.Simplify is not implemented on web",
  PictureViewCrashTest: "intentional crash reproduction",
  WebMemoryLeak: "intentionally exhausts WebGL contexts",
};

// Screens that render no canvas by design; they must still load cleanly.
const noCanvas: Screen[] = ["List", "Web", "FirstFrameEmpty"];

// Expected uncaught errors, e.g. from examples that demo error handling.
const allowedErrors: Partial<Record<Screen, RegExp>> = {
  Images: /Failed to fetch/, // deliberately loads an invalid image URL
  // The svg4 variant references a local asset (test.png), which the web SVG
  // implementation cannot resolve, so its backing image never loads.
  SVG: /getImageData.*The source width is 0/,
};

const screens = (Object.keys(apiScreenPaths) as Screen[]).filter(
  (name) => skip[name] === undefined
);

test.beforeAll(() => {
  fs.mkdirSync(screenshotsDir, { recursive: true });
});

for (const name of screens) {
  test(name, async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => {
      if (!allowedErrors[name]?.test(error.message)) {
        errors.push(error);
      }
    });
    await page.goto(`/api/${apiScreenPaths[name]}`);
    if (noCanvas.includes(name)) {
      await expect(page.locator("#root > *").first()).toBeVisible();
    } else {
      await expect(page.locator("canvas").first()).toBeVisible({
        timeout: 60_000,
      });
    }
    // Let the example draw a few frames before taking the screenshot.
    await page.waitForTimeout(1_000);
    await page.screenshot({ path: path.join(screenshotsDir, `${name}.png`) });
    expect(
      errors,
      errors.map((error) => error.stack ?? error.message).join("\n")
    ).toEqual([]);
  });
}
