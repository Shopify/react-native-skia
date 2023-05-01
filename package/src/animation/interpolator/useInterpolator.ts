import { useMemo } from "react";
import { SkiaValue } from "../../values";
import { createInterpolator } from "./createInterpolator";

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
