/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useMemo } from "react";

// @ts-ignore
let Reanimated: typeof import("react-native-reanimated") | undefined;
let Core: // @ts-ignore
typeof import("react-native-reanimated/lib/reanimated2/core") | undefined;

try {
  Reanimated = require("react-native-reanimated");
  Core = require("react-native-reanimated/lib/reanimated2/core");
} catch (e) {
  // Ignore
}

type SharedValueTypeWrapper<T = number> = {
  value: T;
};

const useSharedValueWrapper =
  Reanimated?.useSharedValue === undefined
    ? (value: number) => useMemo(() => ({ value }), [value])
    : Reanimated.useSharedValue;

/**
 * Connects a shared value from reanimated to a SkiaView or Canvas
 * so whenever the shared value changes the SkiaView will redraw.
 * @param ref Reference to the SkiaView or Canvas
 * @param value Shared value to add change listeners for
 * @param values Additional (optional) shared values to add change listeners for
 */
export const useSharedValueEffect = <T = number>(
  values: SharedValueTypeWrapper<T>[],
  cb: () => void
) => {
  const input = useSharedValueWrapper(0);
  const { runOnJS, startMapper, stopMapper } = useMemo(() => {
    if (Reanimated && Core) {
      const { runOnJS } = Reanimated;
      const { startMapper, stopMapper } = Core;
      return { runOnJS, startMapper, stopMapper };
    } else {
      console.warn(
        "Reanimated was not found and the useSharedValueEffect hook will have no effect."
      );
      return {
        runOnJS: undefined,
        startMapper: undefined,
        stopMapper: undefined,
      };
    }
  }, []);

  useEffect(() => {
    if (
      startMapper !== undefined &&
      runOnJS !== undefined &&
      stopMapper !== undefined
    ) {
      // Start a mapper in Reanimated
      const mapperId = startMapper(
        () => {
          "worklet";
          runOnJS(cb)();
        },
        values,
        [input]
      );
      // Return unregistering the mapper
      return () => {
        if (stopMapper && mapperId !== undefined) {
          stopMapper(mapperId);
        }
      };
    }
    return () => {};
  }, [input, runOnJS, startMapper, stopMapper, values, cb]);
};
