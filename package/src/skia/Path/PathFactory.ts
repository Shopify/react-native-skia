import type { SkPath, PathOp } from "./Path";

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
}
