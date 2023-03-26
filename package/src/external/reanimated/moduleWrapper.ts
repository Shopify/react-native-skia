import { useMemo } from "react";

import type { SharedValueType } from "../../renderer/processors/Animations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Reanimated: any;
let reanimatedVersion: string;

try {
  const rea = require("react-native-reanimated");
  reanimatedVersion =
    // eslint-disable-next-line import/extensions
    require("react-native-reanimated/package.json").version;
  if (
    reanimatedVersion &&
    (reanimatedVersion >= "3.0.0" || reanimatedVersion.includes("3.0.0-"))
  ) {
    Reanimated = rea;
  }
} catch (e) {}

export const HAS_REANIMATED = !!Reanimated;

function throwOnMissingReanimated() {
  if (!HAS_REANIMATED) {
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
  throwOnMissingReanimated();
  return !!value && Reanimated.isSharedValue(value);
};
