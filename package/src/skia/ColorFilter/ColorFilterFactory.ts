import type { IColor } from "../Color";
import type { BlendMode } from "../Paint/BlendMode";

import type { IColorFilter } from "./ColorFilter";

export type InputColorMatrix = number[];

export interface ColorFilterFactory {
  /**
   * Creates a color filter using the provided color matrix.
   * @param cMatrix
   */
  MakeMatrix(cMatrix: InputColorMatrix): IColorFilter;

  /**
   * Makes a color filter with the given color and blend mode.
   * @param color
   * @param mode
   */
  MakeBlend(color: IColor, mode: BlendMode): IColorFilter;

  /**
   * Makes a color filter composing two color filters.
   * @param outer
   * @param inner
   */
  MakeCompose(outer: IColorFilter, inner: IColorFilter): IColorFilter;

  /**
   * Makes a color filter that is linearly interpolated between two other color filters.
   * @param t - a float in the range of 0.0 to 1.0.
   * @param dst
   * @param src
   */
  MakeLerp(t: number, dst: IColorFilter, src: IColorFilter): IColorFilter;

  /**
   * Makes a color filter that converts between linear colors and sRGB colors.
   */
  MakeLinearToSRGBGamma(): IColorFilter;

  /**
   * Makes a color filter that converts between sRGB colors and linear colors.
   */
  MakeSRGBToLinearGamma(): IColorFilter;
}
