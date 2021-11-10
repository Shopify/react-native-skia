import type { ProcessedColorValue } from "react-native";

import type { IColorFilter } from "./ColorFilter";

export interface IImageFilter {}

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
export interface IImageFilters {
  /**
   *  Create a filter that blurs its input by the separate X and Y sigmas. The provided tile mode
   *  is used when the blur kernel goes outside the input image.
   *  @param sigmaX   The Gaussian sigma value for blurring along the X axis.
   *  @param sigmaY   The Gaussian sigma value for blurring along the Y axis.
   *  @param tileMode The tile mode applied at edges .
   *                  TODO (michaelludwig) - kMirror is not supported yet
   *  @param input    The input filter that is blurred, uses source bitmap if this is null.
   */
  blur: (
    sigmaX: number,
    sigmaY: number,
    tileMode: TileMode,
    input?: IImageFilter
  ) => IImageFilter;
  /**
   *  Create a filter that applies the color filter to the input filter results.
   *  @param cf       The color filter that transforms the input image.
   *  @param input    The input filter, or uses the source bitmap if this is null.
   */
  color: (cf: IColorFilter, input?: IImageFilter) => IImageFilter;
  /**
   *  Create a filter that composes 'inner' with 'outer', such that the results of 'inner' are
   *  treated as the source bitmap passed to 'outer', i.e. result = outer(inner(source)).
   *  @param outer The outer filter that evaluates the results of inner.
   *  @param inner The inner filter that produces the input to outer.
   */
  compose: (outer: IImageFilter, inner: IImageFilter) => IImageFilter;
  /**
   * Create a filter that draws a drop shadow under the input content.
   * This filter produces an image that includes the inputs' content.
   * @param dx The X offset of the shadow.
   * @param dy	The Y offset of the shadow.
   * @param sigmaX	The blur radius for the shadow, along the X axis.
   * @param sigmaY	The blur radius for the shadow, along the Y axis.
   * @param color	The color of the drop shadow.
   * @param input	The input filter, or will use the source bitmap if this is null.
   * @param cropRect	Optional rectangle that crops the input and output.
   */
  dropshadow: (
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: ProcessedColorValue | null | undefined,
    input?: IImageFilter
  ) => IImageFilter;
  /**
   * Create a filter that renders a drop shadow, in exactly the same manner as ::DropShadow, except
   * that the resulting image does not include the input content.
   * This allows the shadow and input to be composed by a filter DAG in a more flexible manner.
   * @param dx The X offset of the shadow.
   * @param dy	The Y offset of the shadow.
   * @param sigmaX	The blur radius for the shadow, along the X axis.
   * @param sigmaY	The blur radius for the shadow, along the Y axis.
   * @param color	The color of the drop shadow.
   * @param input	The input filter, or will use the source bitmap if this is null.
   * @param cropRect	Optional rectangle that crops the input and output.
   */
  dropshadowOnly: (
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: ProcessedColorValue | null | undefined,
    input?: IImageFilter
  ) => IImageFilter;
}
