import { ValueApi } from "../../values/api";

export const createInterpolator = <T>(
  inputs: Array<number>,
  outputs: Array<T>
) => {
  return ValueApi.createInterpolator({ inputs, outputs });
};
