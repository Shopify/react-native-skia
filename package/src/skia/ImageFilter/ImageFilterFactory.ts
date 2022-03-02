import type { IColor } from "../Color";
import type { IColorFilter } from "../ColorFilter/ColorFilter";
import type { IShader } from "../Shader/Shader";

import type { IImageFilter, TileMode } from "./ImageFilter";

export enum ColorChannel {
  R,
  G,
  B,
  A,
}

export interface ImageFilterFactory {
  /**
   * Offsets the input image
   *
   * @param dx - Offset along the X axis
   * @param dy - Offset along the X axis
   * @param input - if null, it will use the dynamic source image
   */
  MakeOffset(dx: number, dy: number, input: IImageFilter | null): IImageFilter;
  /**
   * Spatially displace pixel values of the filtered image
   *
   * @param channelX - Color channel to be used along the X axis
   * @param channelY - Color channel to be used along the Y axis
   * @param scale - Scale factor to be used in the displacement
   * @param in1 - Source image filter to use for the displacement
   * @param input - if null, it will use the dynamic source image
   */
  MakeDisplacementMap(
    channelX: ColorChannel,
    channelY: ColorChannel,
    scale: number,
    in1: IImageFilter,
    input: IImageFilter | null
  ): IImageFilter;
  /**
   * Transforms a shader into an impage filter
   *
   * @param shader - The Shader to be transformed
   * @param input - if null, it will use the dynamic source image
   */
  MakeShader(shader: IShader, input: IImageFilter | null): IImageFilter;
  /**
   * Create a filter that blurs its input by the separate X and Y sigmas. The provided tile mode
   * is used when the blur kernel goes outside the input image.
   *
   * @param sigmaX - The Gaussian sigma value for blurring along the X axis.
   * @param sigmaY - The Gaussian sigma value for blurring along the Y axis.
   * @param mode
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeBlur(
    sigmaX: number,
    sigmaY: number,
    mode: TileMode,
    input: IImageFilter | null
  ): IImageFilter;

  /**
   * Create a filter that applies the color filter to the input filter results.
   * @param cf
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeColorFilter(cf: IColorFilter, input: IImageFilter | null): IImageFilter;

  /**
   * Create a filter that composes 'inner' with 'outer', such that the results of 'inner' are
   * treated as the source bitmap passed to 'outer'.
   * If either param is null, the other param will be returned.
   * @param outer
   * @param inner - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeCompose(
    outer: IImageFilter | null,
    inner: IImageFilter | null
  ): IImageFilter;

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
  MakeDropShadow: (
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: IColor,
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
  MakeDropShadowOnly: (
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: IColor,
    input?: IImageFilter
  ) => IImageFilter;
}
