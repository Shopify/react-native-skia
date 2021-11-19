import type { Path, PathOp } from "./Path";

export interface PathFactory {
  Make(): Path;
  /**
   * Creates a new path from the provided SVG string. If this fails, null will be
   * returned instead.
   * @param str
   */
  MakeFromSVGString(str: string): Path | null;

  /**
   * Creates a new path by combining the given paths according to op. If this fails, null will
   * be returned instead.
   * @param one
   * @param two
   * @param op
   */
  MakeFromOp(one: Path, two: Path, op: PathOp): Path | null;
}
