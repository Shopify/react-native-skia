import type { IPath, PathOp } from "./Path";

export interface PathFactory {
  Make(): IPath;
  /**
   * Creates a new path from the provided SVG string. If this fails, null will be
   * returned instead.
   * @param str
   */
  MakeFromSVGString(str: string): IPath | null;

  /**
   * Creates a new path by combining the given paths according to op. If this fails, null will
   * be returned instead.
   * @param one
   * @param two
   * @param op
   */
  MakeFromOp(one: IPath, two: IPath, op: PathOp): IPath | null;
}
