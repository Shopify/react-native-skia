import { useEffect, useMemo } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Reanimated: any;

try {
  Reanimated = require("react-native-reanimated");
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
 * @param cb Callback that will be called whenever the shared value changes.
 * @param values One or more shared values to listen for.
 */
export const useSharedValueEffect = <T = number>(
  cb: () => void,
  value: SharedValueTypeWrapper<T>,
  ...values: SharedValueTypeWrapper<T>[]
) => {
  const input = useSharedValueWrapper(0);

  useEffect(() => {
    if (!Reanimated) {
      console.warn(
        "Reanimated was not found and the useSharedValueEffect hook will have no effect."
      );
    } else {
      const { runOnJS, startMapper, stopMapper } = Reanimated;

      // Start a mapper in Reanimated
      const mapperId = startMapper(
        () => {
          "worklet";
          runOnJS(cb)();
        },
        [value, ...values],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, value, ...values]);
};
