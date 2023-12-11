import { useEffect } from "react";

import type { SkiaValue } from "../types";

/**
 * @deprecated Use Reanimated 3
 * for animating Skia: https://shopify.github.io/react-native-skia/docs/animations/animations
 *
 * Sets up an effect that will be run whenever the value changes
 * @param value Value to subscribe to changes on
 * @param cb Callback to run when value changes
 */
export const useValueEffect = <T>(value: SkiaValue<T>, cb: (v: T) => void) => {
  useEffect(() => {
    return value.addListener(cb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
};
