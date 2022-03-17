import { useMemo } from "react";

import type { SkiaReadonlyValue } from "../types";
import { ValueApi } from "../api";

type CreateDerivedvalue = typeof ValueApi.createDerivedValue;

/**
 * Creates a new derived value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Dependant values
 * @returns A readonly value
 */
export const useDerivedValue: CreateDerivedvalue = <R>(
  cb: (...args: Array<unknown>) => R,
  values: Array<SkiaReadonlyValue<unknown>>
): SkiaReadonlyValue<R> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ValueApi.createDerivedValue(cb, values), values);
};
