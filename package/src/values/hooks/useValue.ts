import { useMemo } from "react";

import { ValueApi } from "../api";
import type { SkiaMutableValue } from "../types";

/**
 * Creates a new value that holds some data.
 * @param v Value to hold
 * @returns A Value of type of v
 */
export const useValue = <T>(v: T): SkiaMutableValue<T> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ValueApi.createValue(v), []);
};
