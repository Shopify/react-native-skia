import { useMemo } from "react";

import type { SkiaReadonlyValue } from "../types";
import { ValueApi } from "../api";
import { useValue } from "./useValue";

type CreateDerivedvalue = typeof ValueApi.createDerivedValue;

/**
 * Creates a new derived value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Depenedant values
 * @returns A readonly value
 */
export const useDerivedValue: CreateDerivedvalue = <R, A extends Array<unknown> = Array<unknown>>(
  cb: (...args: A extends readonly [...infer Args] ? [...Args] : A) => R,
  values: Array<SkiaReadonlyValue<A extends readonly [...infer Args] ? Args: unknown>>
): SkiaReadonlyValue<R> => {
  return useMemo(() => ValueApi.createDerivedValue(cb, values), values);
};
