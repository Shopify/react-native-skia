import { useMemo } from "react";

import type { SkiaReadonlyValue } from "../types";
import { ValueApi } from "../api";

/**
 * Creates a new derived value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Depenedant values
 * @returns A readonly value
 */
export const useDerivedValue = <R>(
  cb: () => R,
  values: Array<SkiaReadonlyValue<unknown>>
): SkiaReadonlyValue<R> => {
  return useMemo(
    () => ValueApi.createDerivedValue<R>(cb, values),
    [cb, values]
  );
};
