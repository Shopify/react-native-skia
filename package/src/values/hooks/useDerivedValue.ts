import { useMemo } from "react";

import type { CreateDerivedValue, IReadonlyValue } from "../types";

/**
 * Creates a new derived value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Depenedant values
 * @returns A readonly value
 */
export const useDerivedValue: CreateDerivedValue = <R>(
  cb: (...args: Array<unknown>) => R,
  values: Array<IReadonlyValue<unknown>>
): IReadonlyValue<R> => {
  return useMemo(
    () => global.SkiaValueApi.createDerivedValue(cb, values),
    [cb, values]
  );
};
