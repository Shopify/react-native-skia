import { ValueApi } from "../../values/api";
import { validateInterpolationOptions } from "../functions";
import { ExtrapolationType } from "./types";

export const createInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>,
  type?: ExtrapolationType
) => {
  const { extrapolateLeft, extrapolateRight } =
    validateInterpolationOptions(type);
  return ValueApi.createInterpolator({
    inputs,
    outputs,
    extrapolateLeft,
    extrapolateRight,
  });
};
