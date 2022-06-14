import type { SkPath } from "../../skia/types";

/**
 * Maps an input value within a range to an output path within a path range.
 * @param value - The input value.
 * @param inputRange - The range of the input value.
 * @param outputRange - The range of the output path.
 * @returns The output path.
 * @example <caption>Map a value between 0 and 1 to a path between two paths.</caption>
 * const path1 = new Path();
 * path1.moveTo(0, 0);
 * path1.lineTo(100, 0);
 * const path2 = new Path();
 * path2.moveTo(0, 0);
 * path2.lineTo(0, 100);
 * const path = interpolatePath(0.5, [0, 1], [path1, path2]);
 */
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
      if (value < input[0]) {
        return outputRange[0];
      } else {
        return outputRange[i];
      }
    }
  }
  const t = (value - input[i]) / (input[i + 1] - input[i]);
  return outputRange[i + 1].interpolate(outputRange[i], t)!;
};
