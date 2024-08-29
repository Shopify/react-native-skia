import type { SkJSIInstance } from "./JsiInstance";

export enum BlurStyle {
  Normal, //!< fuzzy inside and outside
  Solid, //!< solid inside, fuzzy outside
  Outer, //!< nothing inside, fuzzy outside
  Inner, //!< fuzzy inside, nothing outside
}

export const isMaskFilter = (
  obj: SkJSIInstance<string> | null
): obj is SkMaskFilter => obj !== null && obj.__typename__ === "MaskFilter";

export type SkMaskFilter = SkJSIInstance<"MaskFilter">;

/**
 * See SkMaskFilter.h for more details.
 */
export interface MaskFilterFactory {
  /**
   * Create a blur maskfilter
   * @param style
   * @param sigma - Standard deviation of the Gaussian blur to apply. Must be > 0.
   * @param respectCTM - if true the blur's sigma is modified by the CTM.
   */
  MakeBlur(style: BlurStyle, sigma: number, respectCTM: boolean): SkMaskFilter;
}
