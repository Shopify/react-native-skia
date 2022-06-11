import type { SkPath } from "../../skia/types";

export const interpolatePaths = (
  value: number,
  input: number[],
  outputRange: SkPath[]
) => {
  let i = 0;
  for (; i <= input.length - 1; i++) {
    if (value >= input[i] && value <= input[i + 1]) {
      break;
    }
    if (i === input.length - 1) {
      return outputRange[i];
    }
  }
  const t = (value - input[i]) / (input[i + 1] - input[i]);
  return outputRange[i + 1].interpolate(outputRange[i], t);
};
