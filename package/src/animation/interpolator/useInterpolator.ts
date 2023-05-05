import { useMemo } from "react";
import { SkiaValue } from "../../values";
import { createInterpolator } from "./createInterpolator";

/**
 * Creates a managed interpolator value that can be used to animate values
 * with keyframes like interpolation.
 * //TODO: Support extrapolation
 * @param value
 * @param inputs
 * @param outputs
 * @returns
 */
export const useInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>
) => {
  return useMemo(() => {
    const interpolator = createInterpolator(inputs, outputs);
    interpolator.animation = value;
    return interpolator;
  }, [inputs, outputs, value]);
};
