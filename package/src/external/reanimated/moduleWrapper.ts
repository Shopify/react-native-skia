import { useMemo } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Reanimated: any;

try {
  Reanimated = require("react-native-reanimated");
} catch (e) {
  // Ignore
}

export const HAS_REANIMATED = Reanimated !== undefined;

function throwOnMissingReanimated() {
  throw new Error(
    "Reanimated was not found, make sure react-native-reanimated package is installed if you want to use \
    react-naitve-skia's integration layer API."
  );
}

export const useSharedValue =
  Reanimated?.useSharedValue ||
  ((value: number) => useMemo(() => ({ value }), [value]));

export const startMapper = Reanimated?.startMapper || throwOnMissingReanimated;
export const stopMapper = Reanimated?.stopMapper || throwOnMissingReanimated;
export const runOnJS = Reanimated?.runOnJS || throwOnMissingReanimated;
export const isSharedValue =
  Reanimated?.isSharedValue || throwOnMissingReanimated;

export type SharedValueType<T = number> = {
  value: T;
};
