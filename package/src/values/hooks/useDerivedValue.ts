import { useMemo } from "react";

import { ValueApi } from "../api";
import { isValue } from "../../renderer/processors";

export const useDerivedValue = <R>(cb: () => R, values: unknown[]) => {
  console.warn(
    "useDerivedValue is deprecated. Use useDerivedSkiaValue instead."
  );
  return useDerivedSkiaValue(cb, values);
};

/**
 * Creates a new derived value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Dependant values
 * @returns A readonly value
 */
export const useDerivedSkiaValue = <R>(cb: () => R, values: unknown[]) =>
  useMemo(
    () => ValueApi.createDerivedValue<R>(cb, values.filter(isValue)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    values
  );
