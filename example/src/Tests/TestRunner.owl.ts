import { press, takeScreenshot } from "react-native-owl";

jest.mock("@shopify/react-native-skia", () => {
  return require("../../../package/src/mock").Mock;
});

import { TestBattery } from "./TestBattery";
import type { TestHierarchy, Tests } from "./types";
import { isTest } from "./types";

describe("RN Skia Tests", () => {
  beforeAll(async () => {
    await press("Tests");
  });

  afterEach(async () => {
    await press("Back");
  });

  mapTests(TestBattery);
});

function mapTests(
  t: TestHierarchy | Tests,
  parentKey = "",
  path: string[] = []
) {
  const keys = Object.keys(t);
  keys.forEach((key, index) => {
    const maybeTest = t[key];
    if (isTest(maybeTest)) {
      it(key, async () => {
        if (index === 0 && parentKey !== "") {
          // Navigate to parent
          await press(parentKey);
        }
        // Navigate to the test:
        await press(key);
        const screen = await takeScreenshot(path.join("_") + "_" + key);
        await expect(screen).toMatchBaseline();

        if (index === keys.length - 1) {
          await press("Back");
        }
      });
    } else {
      describe(key, () => mapTests(maybeTest, key, [...path, key]));
    }
  });
}
