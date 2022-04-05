import { useEffect } from "react";

import type { SkiaReadonlyValue } from "../types";

/**
 * Sets up an effect that will be run whenever the value changes
 * @param value Value to subscribe to changes on
 * @param cb Callback to run when value changes
 */
export const useValueEffect = <T>(
  value: SkiaReadonlyValue<T>,
  cb: (v: T) => void
) => {
  useEffect(() => {
    return value.addListener(cb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
};
