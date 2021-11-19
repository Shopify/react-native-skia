import type { Color } from "../Color";
import type { BlendMode } from "../Paint/BlendMode";

import type { ColorFilter } from "./ColorFilter";

export type InputColorMatrix = number[];

export interface ColorFilterFactory {
  /**
   * Creates a color filter using the provided color matrix.
   * @param cMatrix
   */
  MakeMatrix(cMatrix: InputColorMatrix): ColorFilter;

  /**
   * Makes a color filter with the given color and blend mode.
   * @param color
   * @param mode
   */
  MakeBlend(color: Color, mode: BlendMode): ColorFilter;

  /**
   * Makes a color filter composing two color filters.
   * @param outer
   * @param inner
   */
  MakeCompose(outer: ColorFilter, inner: ColorFilter): ColorFilter;

  /**
   * Makes a color filter that is linearly interpolated between two other color filters.
   * @param t - a float in the range of 0.0 to 1.0.
   * @param dst
   * @param src
   */
  MakeLerp(t: number, dst: ColorFilter, src: ColorFilter): ColorFilter;

  /**
   * Makes a color filter that converts between linear colors and sRGB colors.
   */
  MakeLinearToSRGBGamma(): ColorFilter;

  /**
   * Makes a color filter that converts between sRGB colors and linear colors.
   */
  MakeSRGBToLinearGamma(): ColorFilter;
}
