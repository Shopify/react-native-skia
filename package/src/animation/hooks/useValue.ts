import { useMemo } from "react";

import { createValue } from "../Value";
import type { AnimationValue } from "../types";

/**
 * Creates a shared value that can be used in animations and
 * drawing in the Canvas children.
 * @param initialValue
 * @returns A shared value
 */
export const useValue = <T = number>(initialValue: T): AnimationValue<T> => {
  return useMemo(() => createValue<T>(initialValue), [initialValue]);
};
