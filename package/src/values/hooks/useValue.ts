import { useMemo } from "react";

import type { IValue } from "../types";

/**
 * Creates a new value that holds some data.
 * @param v Value to hold
 * @returns A Value of type of v
 */
export const useValue = <T>(v: T): IValue<T> => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => global.SkiaValueApi.createValue(v), []);
};
