import { useMemo } from "react";

import { ValueApi } from "../api";
import { isValue } from "../../renderer/processors/Animations";

/**
 * Creates a new computed value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Dependant values
 * @returns A readonly value
 */
export const useComputedValue = <R>(cb: () => R, values: unknown[]) =>
  useMemo(
    () => ValueApi.createComputedValue<R>(cb, values.filter(isValue)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    values
  );

/**
 * Creates a new computed value that returns an array that can be indexed into.
 * The syntax for using it is like this:
 * ```ts
 * const colors = useComputedArrayValue(() => ["red", "green", "blue""], [input]);
 * return () => <Canvas>
 *   {arr.map((_, i) => <Rectangle fill={colors(i)} />)}
 * </Canvas>;
 * ```
 * @param cb Callback to calculate new value
 * @param values Dependant values
 * @returns A factory function that returns a description of the value and the index to access
 */
export const useComputedArrayValue = <R>(cb: () => R, values: unknown[]) => {
  const value = useComputedValue(cb, values);
  return (index: number) => ({
    index,
    value,
  });
};

export const useDerivedValue = <R>(cb: () => R, values: unknown[]) => {
  console.warn("useDerivedValue is deprecated. Use useComputedValue instead.");
  return useComputedValue(cb, values);
};
