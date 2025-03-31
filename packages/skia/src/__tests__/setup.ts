import path from "path";
import fs from "fs";

import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { diff } from "jest-diff";

import type { SkSurface, SkImage } from "../skia/types";

export const E2E = process.env.E2E === "true";
export const CI = process.env.CI === "true";
export const itFailsE2e = E2E ? it.failing : it;
export const itRunsE2eOnly = E2E ? it : it.skip;
export const itRunsNodeOnly = E2E ? it.skip : it;
export const itRunsCIAndNodeOnly = CI || !E2E ? it : it.skip;

// Custom matcher for approximately equal SVG path strings
expect.extend({
  toApproximatelyEqual(received, expected) {
    // For arrays, we check each element
    if (Array.isArray(received) && Array.isArray(expected)) {
      if (received.length !== expected.length) {
        return {
          message: () =>
            `Expected array of length ${expected.length}, but received array of length ${received.length}`,
          pass: false,
        };
      }

      for (let i = 0; i < received.length; i++) {
        const result = this.equals(received[i], expected[i]);
        if (!result) {
          return {
            message: () =>
              `Array elements at index ${i} are not approximately equal:\n` +
              `Expected: ${expected[i]}\n` +
              `Received: ${received[i]}`,
            pass: false,
          };
        }
      }
      return {
        message: () => "Arrays are approximately equal",
        pass: true,
      };
    }

    // For SVG path strings, we need to handle floating point values
    if (typeof received === "string" && typeof expected === "string") {
      // Extract all numbers from SVG path strings
      const extractNumbers = (str: string) => {
        const numbers: number[] = [];
        const regex = /-?\d+(\.\d+)?/g;
        let match;
        while ((match = regex.exec(str)) !== null) {
          numbers.push(parseFloat(match[0]));
        }
        return numbers;
      };

      const receivedNumbers = extractNumbers(received);
      const expectedNumbers = extractNumbers(expected);

      if (receivedNumbers.length !== expectedNumbers.length) {
        return {
          message: () =>
            "SVG path strings have different number of values:\n" +
            `Expected: ${expected}\n` +
            `Received: ${received}`,
          pass: false,
        };
      }

      // Check if all numbers are approximately equal
      const EPSILON = 0.001; // Tolerance threshold
      for (let i = 0; i < receivedNumbers.length; i++) {
        if (Math.abs(receivedNumbers[i] - expectedNumbers[i]) > EPSILON) {
          return {
            message: () =>
              `SVG path strings differ at position ${i}:\n` +
              `Expected: ${expectedNumbers[i]}\n` +
              `Received: ${receivedNumbers[i]}\n` +
              `Difference: ${Math.abs(
                receivedNumbers[i] - expectedNumbers[i]
              )}`,
            pass: false,
          };
        }
      }
      return {
        message: () => "SVG path strings are approximately equal",
        pass: true,
      };
    }

    // Default case: fall back to exact equality
    const pass = this.equals(received, expected);
    return {
      message: () =>
        pass
          ? "Values are approximately equal"
          : `Expected: ${expected}\nReceived: ${received}`,
      pass,
    };
  },
});

// Make TypeScript aware of our custom matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toApproximatelyEqual: (expected: any) => R;
    }
  }
}

export const docPath = (relPath: string) =>
  path.resolve(process.cwd(), `../../apps/docs/static/img/${relPath}`);

export const processResult = (
  surface: SkSurface,
  relPath: string,
  overwrite = false
) => {
  surface.flush();
  const image = surface.makeImageSnapshot();
  surface.getCanvas().clear(Float32Array.of(0, 0, 0, 0));
  const result = checkImage(image, relPath, { overwrite });
  image.dispose();
  return result;
};

interface CheckImageOptions {
  maxPixelDiff?: number;
  threshold?: number;
  overwrite?: boolean;
  mute?: boolean;
  shouldFail?: boolean;
}

// On Github Action, the image decoding is slightly different
// all tests that show the oslo.jpg have small differences but look ok
const defaultCheckImageOptions = {
  maxPixelDiff: 200,
  threshold: 0.1,
  overwrite: false,
  mute: false,
  shouldFail: false,
};

export const checkImage = (
  image: SkImage,
  relPath: string,
  opts?: CheckImageOptions
) => {
  const options = { ...defaultCheckImageOptions, ...opts };
  const { overwrite, threshold, mute, maxPixelDiff, shouldFail } = options;
  const png = image.encodeToBytes();
  const p = path.resolve(__dirname, relPath);
  if (fs.existsSync(p) && !overwrite) {
    const ref = fs.readFileSync(p);
    const baseline = PNG.sync.read(ref);
    const toTest = PNG.sync.read(Buffer.from(image.encodeToBytes()));
    const diffImage = new PNG({
      width: baseline.width,
      height: baseline.height,
    });
    if (baseline.width !== toTest.width || baseline.height !== toTest.height) {
      throw new Error(
        `Image sizes don't match: ${baseline.width}x${baseline.height} vs ${toTest.width}x${toTest.height}`
      );
    }
    const diffPixelsCount = pixelmatch(
      baseline.data,
      toTest.data,
      diffImage.data,
      baseline.width,
      baseline.height,
      { threshold }
    );
    if (!mute) {
      if (diffPixelsCount > maxPixelDiff && !shouldFail) {
        console.log(`${p} didn't match`);
        fs.writeFileSync(`${p}.test.png`, PNG.sync.write(toTest));
        //fs.writeFileSync(`${p}-diff-test.png`, PNG.sync.write(diffImage));
      }
      if (shouldFail) {
        expect(diffPixelsCount).not.toBeLessThanOrEqual(maxPixelDiff);
      } else {
        expect(diffPixelsCount).toBeLessThanOrEqual(maxPixelDiff);
      }
    }
    return diffPixelsCount;
  } else {
    fs.writeFileSync(p, png);
  }
  return 0;
};

expect.extend({
  toBeApproximatelyEqual(_received, _argument, tolerance = 0.1) {
    const received =
      Array.isArray(_received) || _received instanceof Float32Array
        ? _received
        : [_received];
    const argument =
      Array.isArray(_argument) || _received instanceof Float32Array
        ? _argument
        : [_argument];
    if (received.length !== argument.length) {
      return { pass: false, message: () => "Arrays have different lengths" };
    }
    for (let i = 0; i < received.length; i++) {
      if (
        isNaN(argument[i]) ||
        isNaN(received[i]) ||
        Math.abs(received[i] - argument[i]) > tolerance
      ) {
        const diffString = diff(received, argument);
        return {
          pass: false,
          message: () => `Element at index ${i} differ more than ${tolerance}:
${diffString}`,
        };
      }
    }
    return { pass: true, message: () => "Arrays are approximately equal" };
  },
});
