import type { SkJSIInstance } from "../JsiInstance";
export declare enum TileMode {
    /**
     *  Replicate the edge color if the shader draws outside of its
     *  original bounds.
     */
    Clamp = 0,
    /**
     *  Repeat the shader's image horizontally and vertically.
     */
    Repeat = 1,
    /**
     *  Repeat the shader's image horizontally and vertically, alternating
     *  mirror images so that adjacent images always seam.
     */
    Mirror = 2,
    /**
     *  Only draw within the original domain, return transparent-black everywhere else.
     */
    Decal = 3
}
export declare const isImageFilter: (obj: SkJSIInstance<string> | null) => obj is SkImageFilter;
export type SkImageFilter = SkJSIInstance<"ImageFilter">;
