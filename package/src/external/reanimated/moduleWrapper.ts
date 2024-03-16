/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DependencyList } from "react";
import type {
  DerivedValue,
  FrameCallback,
  FrameInfo,
  SharedValue,
} from "react-native-reanimated";

// This one is needed for the deprecated useSharedValue function
// We can remove it once we remove the deprecation

let Reanimated2: any;

let Reanimated3: any;
let reanimatedVersion: string;

try {
  Reanimated2 = require("react-native-reanimated");
  reanimatedVersion = require("react-native-reanimated/package.json").version;
  if (
    reanimatedVersion &&
    (reanimatedVersion >= "3.0.0" || reanimatedVersion.includes("3.0.0-"))
  ) {
    Reanimated3 = Reanimated2;
  }
} catch (e) {}

export const HAS_REANIMATED2 = !!Reanimated2;
export const HAS_REANIMATED3 = !!Reanimated3;

export function throwOnMissingReanimated() {
  if (!HAS_REANIMATED2) {
    throw new Error(
      "Reanimated was not found, make sure react-native-reanimated package is installed if you want to use \
      react-native-skia's integration layer API."
    );
  }
}

export const useSharedValue: <T>(
  init: T,
  oneWayReadsOnly?: boolean
) => SharedValue<T> = Reanimated2?.useSharedValue || throwOnMissingReanimated;

export const useDerivedValue: <T>(
  processor: () => T,
  dependencies?: DependencyList
) => DerivedValue<T> = Reanimated2?.useDerivedValue || throwOnMissingReanimated;

export const useFrameCallback: (
  callback: (frameInfo: FrameInfo) => void,
  autostart?: boolean
) => FrameCallback = Reanimated2?.useFrameCallback || throwOnMissingReanimated;

export const startMapper: (
  worklet: () => void,
  inputs?: unknown[],
  outputs?: unknown[]
) => number = Reanimated2?.startMapper || throwOnMissingReanimated;

export const stopMapper: (mapperID: number) => void =
  Reanimated2?.stopMapper || throwOnMissingReanimated;

export const runOnJS = Reanimated2?.runOnJS || throwOnMissingReanimated;
export const runOnUI = Reanimated2?.runOnUI || throwOnMissingReanimated;
export const makeMutable: <T>(val: T) => SharedValue<T> =
  Reanimated2?.makeMutable || throwOnMissingReanimated;

export const useAnimatedReaction: <T>(
  prepare: () => T,
  react: (v: T) => void,
  dependencies?: DependencyList
) => void = Reanimated2?.useAnimatedReaction || throwOnMissingReanimated;

export const isSharedValue = <T>(value: unknown): value is SharedValue<T> => {
  return (
    !!value &&
    (Reanimated3
      ? Reanimated3.isSharedValue(value)
      : (value as any).value !== undefined)
  );
};
