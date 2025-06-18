import type { SkJSIInstance } from "./JsiInstance";
export declare enum BlurStyle {
    Normal = 0,//!< fuzzy inside and outside
    Solid = 1,//!< solid inside, fuzzy outside
    Outer = 2,//!< nothing inside, fuzzy outside
    Inner = 3
}
export declare const isMaskFilter: (obj: SkJSIInstance<string> | null) => obj is SkMaskFilter;
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
