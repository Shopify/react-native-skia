import type { DependencyList } from "react";
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
  values: Array<IReadonlyValue<unknown>>,
  deps?: DependencyList
): IReadonlyValue<R> => {
  return useMemo(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    () => global.SkiaValueApi.createDerivedValue(cb, values),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cb, values, deps]
  );
};
