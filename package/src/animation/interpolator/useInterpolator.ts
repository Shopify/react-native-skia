import { useMemo } from "react";
import { SkiaMutableValue, SkiaValue } from "../../values";
import {
  createColorInterpolator,
  createMatrixInterpolator,
  createNumericInterpolator,
  createPathInterpolator,
  createPointInterpolator,
  createRRectInterpolator,
  createRectInterpolator,
  createTransformInterpolator,
} from "./createInterpolator";
import { ExtrapolationType } from "./types";

/**
 * Creates a managed interpolator value that can be used to animate values
 * with keyframes like interpolation.
 * //TODO: Support extrapolation
 * @param value
 * @param inputs
 * @param outputs
 * @returns
 */
const useInterpolator = <T>(
  factory: <T>(
    inputs: Array<number>,
    outputs: Array<T>,
    type?: ExtrapolationType
  ) => SkiaMutableValue<T>,
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => {
  return useMemo(() => {
    const interpolator = factory(inputs, outputs, type);
    interpolator.animation = value;
    return interpolator;
  }, [inputs, outputs, value]);
};

export const useColorInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => useInterpolator(createColorInterpolator, value, inputs, outputs, type);

export const useMatrixInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => useInterpolator(createMatrixInterpolator, value, inputs, outputs, type);

export const useNumericInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => useInterpolator(createNumericInterpolator, value, inputs, outputs, type);

export const usePathInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => useInterpolator(createPathInterpolator, value, inputs, outputs, type);

export const usePointInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => useInterpolator(createPointInterpolator, value, inputs, outputs, type);

export const useRectInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => useInterpolator(createRectInterpolator, value, inputs, outputs, type);

export const useRRectInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => useInterpolator(createRRectInterpolator, value, inputs, outputs, type);

export const useTransformInterpolator = <T>(
  value: SkiaValue,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => useInterpolator(createTransformInterpolator, value, inputs, outputs, type);
