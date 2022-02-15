import { useEffect, useMemo } from "react";

import type { ReadonlyValue } from "../types";

/**
 * Sets up an effect that will be run whenever the value changes
 * @param value Value to subscribe to changes on
 * @param cb Callback to run when value changes
 */
export const useValueEffect = <T>(
  value: ReadonlyValue<T>,
  cb: (v: T) => void
) => {
  const memoizedCb = useMemo(() => cb, [cb]);
  useEffect(() => {
    return value.addListener(memoizedCb);
  }, [memoizedCb, value]);
};
