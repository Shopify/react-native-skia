import type { SkFont } from "../Font";

import type { SkPath, PathOp, PathCommand } from "./Path";

export interface PathFactory {
  Make(): SkPath;
  /**
   * Creates a new path from the provided SVG string. If this fails, null will be
   * returned instead.
   * @param str
   */
  MakeFromSVGString(str: string): SkPath | null;

  /**
   * Creates a new path by combining the given paths according to op. If this fails, null will
   * be returned instead.
   * @param one
   * @param two
   * @param op
   */
  MakeFromOp(one: SkPath, two: SkPath, op: PathOp): SkPath | null;

  /**
   * Creates a new path from the given list of path commands. If this fails, null will be
   * returned instead.
   * @param cmds
   */
  MakeFromCmds(cmds: PathCommand[]): SkPath | null;

  /**
   * Converts the text to a path with the given font at location x / y.
   */
  MakeFromText(text: string, x: number, y: number, font: SkFont): SkPath | null;

  /**
   * Interpolates between Path with point array of equal size.
   * Copy verb array and weights to result, and set result path to a weighted
   * average of this path array and ending path.
   *
   *  weight is most useful when between zero (ending path) and
   *  one (this path); will work with values outside of this
   *  range.
   *
   * MakeFromPathInterpolation() returns false if path is not
   * the same size as ending path. Call isInterpolatable() to check Path
   * compatibility prior to calling MakeFromPathInterpolation().
   *
   * @param start path to interpolate from
   * @param end  path to interpolate with
   * @param weight  contribution of this path, and
   *                 one minus contribution of ending path
   * @param result  path containing the result
   * @return        true or false depending on success
   */
  MakeFromPathInterpolation(
    from: SkPath,
    to: SkPath,
    weight: number,
    result: SkPath
  ): boolean;
}
