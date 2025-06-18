export const __esModule: boolean;
/**
 * Maps an input value within a range to an output path within a path range.
 * @param value - The input value.
 * @param inputRange - The range of the input value.
 * @param outputRange - The range of the output path.
 * @param options - Extrapolation options
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
export function interpolatePaths(value: any, input: any, outputRange: any, options: any, output: any): any;
