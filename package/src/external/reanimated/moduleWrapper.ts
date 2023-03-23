import { useMemo } from "react";

import type { SharedValueType } from "../../renderer/processors/Animations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Reanimated: any;

try {
  Reanimated = require("react-native-reanimated");
} catch (e) {
  // Ignore
}

export const HAS_REANIMATED = !!Reanimated;

function throwOnMissingReanimated() {
  throw new Error(
    "Reanimated was not found, make sure react-native-reanimated package is installed if you want to use \
    react-naitve-skia's integration layer API."
  );
}

let ReanimatedVersionTested = false;

export function throwOnIncompatibleReanimatedVersion() {
  if (ReanimatedVersionTested) {
    // we avoid testing version more than once as it won't change and we throw
    // an error when version is incompatible
    return;
  }
  ReanimatedVersionTested = true;
  let reanimatedVersion: false | string = false;
  try {
    // The first compatible version is 3.0.0 but we need to exclude 3.0.0 pre-releases
    // as they have limited support for the used API.
    // eslint-disable-next-line import/extensions
    reanimatedVersion = require("react-native-reanimated/package.json").version;
  } catch (e) {
    // Ignore
  }

  if (
    !reanimatedVersion ||
    reanimatedVersion < "3.0.0" ||
    reanimatedVersion.includes("3.0.0-")
  ) {
    throw new Error(
      `Reanimated version ${reanimatedVersion} is not supported, please upgrade to 3.0.0 or newer.`
    );
  }
}

export const useSharedValue =
  Reanimated?.useSharedValue ||
  ((value: number) => useMemo(() => ({ value }), [value]));

export const startMapper = Reanimated?.startMapper || throwOnMissingReanimated;
export const stopMapper = Reanimated?.stopMapper || throwOnMissingReanimated;
export const runOnJS = Reanimated?.runOnJS || throwOnMissingReanimated;
export const isSharedValue = <T>(
  value: unknown
): value is SharedValueType<T> => {
  if (!Reanimated) {
    throwOnMissingReanimated();
  }
  return !!value && Reanimated.isSharedValue(value);
};
