import type { SkJsiInstane } from "../JsiInstance";

export enum TileMode {
  /**
   *  Replicate the edge color if the shader draws outside of its
   *  original bounds.
   */
  Clamp,

  /**
   *  Repeat the shader's image horizontally and vertically.
   */
  Repeat,

  /**
   *  Repeat the shader's image horizontally and vertically, alternating
   *  mirror images so that adjacent images always seam.
   */
  Mirror,

  /**
   *  Only draw within the original domain, return transparent-black everywhere else.
   */
  Decal,
}

export type ImageFilter = SkJsiInstane<"ImageFilter">;
