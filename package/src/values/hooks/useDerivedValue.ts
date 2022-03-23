import { useMemo } from "react";

import type { SkiaReadonlyValue } from "../types";
import { ValueApi } from "../api";

/**
 * Creates a new derived value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Dependant values
 * @returns A readonly value
 */
export const useDerivedValue = <R>(
  cb: () => R,
  values: SkiaReadonlyValue<unknown>[]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useMemo(() => ValueApi.createDerivedValue<R>(cb, values), values);
