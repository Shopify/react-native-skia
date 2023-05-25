import { SkiaMutableValue } from "../../values";
import { ValueApi } from "../../values/api";
import { validateInterpolationOptions } from "../functions";
import { Extrapolate, ExtrapolationType } from "./types";

const createInterpolator = <T>(
  factory: <T>(config: {
    inputs: Array<number>;
    outputs: Array<T>;
    extrapolateLeft: Extrapolate;
    extrapolateRight: Extrapolate;
  }) => SkiaMutableValue<T>,
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => {
  const { extrapolateLeft, extrapolateRight } =
    validateInterpolationOptions(type);
  return factory({ inputs, outputs, extrapolateLeft, extrapolateRight });
};

export const createColorInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) =>
  createInterpolator(ValueApi.createColorInterpolator, inputs, outputs, type);

export const createMatrixInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) =>
  createInterpolator(ValueApi.createMatrixInterpolator, inputs, outputs, type);

export const createNumericInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) =>
  createInterpolator(ValueApi.createNumericInterpolator, inputs, outputs, type);

export const createPathInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => createInterpolator(ValueApi.createPathInterpolator, inputs, outputs, type);

export const createPointInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) =>
  createInterpolator(ValueApi.createPointInterpolator, inputs, outputs, type);

export const createRectInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => createInterpolator(ValueApi.createRectInterpolator, inputs, outputs, type);

export const createRRectInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) =>
  createInterpolator(ValueApi.createRRectInterpolator, inputs, outputs, type);

export const createTransformInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) =>
  createInterpolator(
    ValueApi.createTransformInterpolator,
    inputs,
    outputs,
    type
  );
