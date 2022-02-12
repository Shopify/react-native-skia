import { useMemo } from "react";

import type { IReadonlyValue } from "../types";
import { Value } from "../api";

type CreateDerivedvalue = typeof Value.createDerivedValue;

/**
 * Creates a new derived value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Depenedant values
 * @returns A readonly value
 */
export const useDerivedValue: CreateDerivedvalue = <R>(
  cb: (...args: Array<unknown>) => R,
  values: Array<IReadonlyValue<unknown>>
): IReadonlyValue<R> => {
  return useMemo(() => Value.createDerivedValue(cb, values), [cb, values]);
};
