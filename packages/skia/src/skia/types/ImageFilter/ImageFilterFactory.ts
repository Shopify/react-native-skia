import type { SkColor } from "../Color";
import type { SkColorFilter } from "../ColorFilter/ColorFilter";
import type { FilterMode, MipmapMode, SkImage } from "../Image/Image";
import type { SkMatrix } from "../Matrix";
import type { BlendMode } from "../Paint";
import type { SkPicture } from "../Picture";
import type { SkRect } from "../Rect";
import type { SkRuntimeShaderBuilder } from "../RuntimeEffect";
import type { SkShader } from "../Shader";

import type { SkImageFilter, TileMode } from "./ImageFilter";

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
   * @param cropRect - Optional rectangle that crops the input and output
   */
  MakeOffset(
    dx: number,
    dy: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;
  /**
   * Spatially displace pixel values of the filtered image
   *
   * @param channelX - Color channel to be used along the X axis
   * @param channelY - Color channel to be used along the Y axis
   * @param scale - Scale factor to be used in the displacement
   * @param in1 - Source image filter to use for the displacement
   * @param input - if null, it will use the dynamic source image
   * @param cropRect - Optional rectangle that crops the input and output
   */
  MakeDisplacementMap(
    channelX: ColorChannel,
    channelY: ColorChannel,
    scale: number,
    in1: SkImageFilter,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;
  /**
   * Transforms a shader into an impage filter
   *
   * @param shader - The Shader to be transformed
   * @param dither - Whether to apply dithering to the shader
   * @param cropRect - Optional rectangle that crops the input and output
   */
  MakeShader(
    shader: SkShader,
    dither?: boolean,
    cropRect?: SkRect | null
  ): SkImageFilter;
  /**
   * Create a filter that blurs its input by the separate X and Y sigmas. The provided tile mode
   * is used when the blur kernel goes outside the input image.
   *
   * @param sigmaX - The Gaussian sigma value for blurring along the X axis.
   * @param sigmaY - The Gaussian sigma value for blurring along the Y axis.
   * @param mode - The tile mode to use when blur kernel goes outside the image
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   * @param cropRect - Optional rectangle that crops the input and output
   */
  MakeBlur(
    sigmaX: number,
    sigmaY: number,
    mode: TileMode,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   * Create a filter that applies the color filter to the input filter results.
   *
   * @param colorFilter - The color filter to apply
   * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
   * @param cropRect - Optional rectangle that crops the input and output
   */
  MakeColorFilter(
    colorFilter: SkColorFilter,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   * Create a filter that composes 'inner' with 'outer', such that the results of 'inner' are
   * treated as the source bitmap passed to 'outer'.
   * If either param is null, the other param will be returned.
   * @param outer
   * @param inner - if null, it will use the dynamic source image (e.g. a saved layer)
   */
  MakeCompose(
    outer: SkImageFilter | null,
    inner: SkImageFilter | null
  ): SkImageFilter;

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
    color: SkColor,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) => SkImageFilter;
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
    color: SkColor,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) => SkImageFilter;
  /**
   *  Create a filter that erodes each input pixel's channel values to the minimum channel value
   *  within the given radii along the x and y axes.
   *  @param radiusX  The distance to erode along the x axis to either side of each pixel.
   *  @param radiusY  The distance to erode along the y axis to either side of each pixel.
   *  @param input    The image filter that is eroded, using source bitmap if this is null.
   *  @param cropRect Optional rectangle that crops the input and output.
   */
  MakeErode: (
    rx: number,
    ry: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) => SkImageFilter;
  /**
   *  Create a filter that dilates each input pixel's channel values to the max value within the
   *  given radii along the x and y axes.
   *  @param radiusX  The distance to dilate along the x axis to either side of each pixel.
   *  @param radiusY  The distance to dilate along the y axis to either side of each pixel.
   *  @param input    The image filter that is dilated, using source bitmap if this is null.
   *  @param cropRect Optional rectangle that crops the input and output.
   */
  MakeDilate: (
    rx: number,
    ry: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) => SkImageFilter;
  /**
   *  This filter takes an SkBlendMode and uses it to composite the two filters together.
   *  @param mode       The blend mode that defines the compositing operation
   *  @param background The Dst pixels used in blending, if null the source bitmap is used.
   *  @param foreground The Src pixels used in blending, if null the source bitmap is used.
   *  @param cropRect   Optional rectangle to crop input and output.
   */
  MakeBlend: (
    mode: BlendMode,
    background: SkImageFilter,
    foreground?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) => SkImageFilter;
  /**
   *  Create a filter that fills the output with the per-pixel evaluation of the SkShader produced
   *  by the SkRuntimeShaderBuilder. The shader is defined in the image filter's local coordinate
   *  system, so it will automatically be affected by SkCanvas' transform.
   *
   *  @param builder         The builder used to produce the runtime shader, that will in turn
   *                         fill the result image
   *  @param childShaderName The name of the child shader defined in the builder that will be
   *                         bound to the input param (or the source image if the input param
   *                         is null).  If null the builder can have exactly one child shader,
   *                         which automatically binds the input param.
   *  @param input           The image filter that will be provided as input to the runtime
   *                         shader. If null the implicit source image is used instead
   */
  MakeRuntimeShader: (
    builder: SkRuntimeShaderBuilder,
    childShaderName: string | null,
    input?: SkImageFilter | null
  ) => SkImageFilter;

  /**
   *  Create a filter that implements a custom blend mode. Each output pixel is the result of
   *  combining the corresponding background and foreground pixels using the 4 coefficients:
   *     k1 * foreground * background + k2 * foreground + k3 * background + k4
   *
   *  @param k1, k2, k3, k4 The four coefficients used to combine the foreground and background.
   *  @param enforcePMColor If true, the RGB channels will be clamped to the calculated alpha.
   *  @param background     The background content, using the source bitmap when this is null.
   *  @param foreground     The foreground content, using the source bitmap when this is null.
   *  @param cropRect       Optional rectangle that crops the inputs and output.
   */
  MakeArithmetic(
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    enforcePMColor: boolean,
    background?: SkImageFilter | null,
    foreground?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that applies a crop to the result of the 'input' filter. Pixels within the
   *  crop rectangle are unmodified from what 'input' produced. Pixels outside of crop match the
   *  provided SkTileMode (defaulting to kDecal).
   *
   *  NOTE: The optional CropRect argument for many of the factories is equivalent to creating the
   *  filter without a CropRect and then wrapping it in ::Crop(rect, kDecal). Explicitly adding
   *  Crop filters lets you control their tiling and use different geometry for the input and the
   *  output of another filter.
   *
   *  @param rect     The cropping rect
   *  @param tileMode The TileMode applied to pixels *outside* of 'crop' @default TileMode.Decal
   *  @param input    The input filter that is cropped, uses source image if this is null
   */
  MakeCrop(
    rect: SkRect,
    tileMode?: TileMode | null,
    input?: SkImageFilter | null
  ): SkImageFilter;

  /**
   * Create a filter that always produces transparent black.
   */
  MakeEmpty(): SkImageFilter;

  /**
   *  Create a filter that draws the 'srcRect' portion of image into 'dstRect' using the given
   *  filter quality. Similar to SkCanvas::drawImageRect. The returned image filter evaluates
   *  to transparent black if 'image' is null.
   *
   *  @param image      The image that is output by the filter, subset by 'srcRect'.
   *  @param srcRect    The source pixels sampled into 'dstRect', if null the image bounds are used.
   *  @param dstRect    The local rectangle to draw the image into, if null the srcRect is used.
   *  @param filterMode The filter mode to use when sampling the image @default FilterMode.Nearest
   *  @param mipmap     The mipmap mode to use when sampling the image @default MipmapMode.None
   */
  MakeImage(
    image: SkImage,
    srcRect?: SkRect | null,
    dstRect?: SkRect | null,
    filterMode?: FilterMode,
    mipmap?: MipmapMode
  ): SkImageFilter;

  /**
   *  Create a filter that fills 'lensBounds' with a magnification of the input.
   *
   *  @param lensBounds The outer bounds of the magnifier effect
   *  @param zoomAmount The amount of magnification applied to the input image
   *  @param inset      The size or width of the fish-eye distortion around the magnified content
   *  @param filterMode The filter mode to use when sampling the image @default FilterMode.Nearest
   *  @param mipmap     The mipmap mode to use when sampling the image @default MipmapMode.None
   *  @param input      The input filter that is magnified; if null the source bitmap is used
   *  @param cropRect   Optional rectangle that crops the input and output.
   */
  MakeMagnifier(
    lensBounds: SkRect,
    zoomAmount: number,
    inset: number,
    filterMode?: FilterMode,
    mipmap?: MipmapMode,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that applies an NxM image processing kernel to the input image. This can be
   *  used to produce effects such as sharpening, blurring, edge detection, etc.
   *  @param kernelSizeX   The width of the kernel. Must be greater than zero.
   *  @param kernelSizeY   The height of the kernel. Must be greater than zero.
   *  @param kernel        The image processing kernel. Must contain kernelSizeX * kernelSizeY elements, in row order.
   *  @param gain          A scale factor applied to each pixel after convolution. This can be
   *                       used to normalize the kernel, if it does not already sum to 1.
   *  @param bias          A bias factor added to each pixel after convolution.
   *  @param kernelOffsetX An offset applied to each pixel coordinate before convolution.
   *                       This can be used to center the kernel over the image
   *                       (e.g., a 3x3 kernel should have an offset of {1, 1}).
   *  @param kernelOffsetY An offset applied to each pixel coordinate before convolution.
   *                       This can be used to center the kernel over the image
   *                       (e.g., a 3x3 kernel should have an offset of {1, 1}).
   *  @param tileMode      How accesses outside the image are treated. TileMode.Mirror is not supported.
   *  @param convolveAlpha If true, all channels are convolved. If false, only the RGB channels
   *                       are convolved, and alpha is copied from the source image.
   *  @param input         The input image filter, if null the source bitmap is used instead.
   *  @param cropRect      Optional rectangle to which the output processing will be limited.
   */
  MakeMatrixConvolution(
    kernelSizeX: number,
    kernelSizeY: number,
    kernel: number[],
    gain: number,
    bias: number,
    kernelOffsetX: number,
    kernelOffsetY: number,
    tileMode: TileMode,
    convolveAlpha: boolean,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that transforms the input image by 'matrix'. This matrix transforms the
   *  local space, which means it effectively happens prior to any transformation coming from the
   *  SkCanvas initiating the filtering.
   *  @param matrix     The matrix to apply to the original content.
   *  @param filterMode The filter mode to use when sampling the image @default FilterMode.Nearest
   *  @param mipmap     The mipmap mode to use when sampling the image @default MipmapMode.None
   *  @param input      The image filter to transform, or null to use the source image.
   */
  MakeMatrixTransform(
    matrix: SkMatrix,
    filterMode?: FilterMode,
    mipmap?: MipmapMode,
    input?: SkImageFilter | null
  ): SkImageFilter;

  /**
   *  Create a filter that merges filters together by drawing their results in order
   *  with src-over blending.
   *  @param filters  The input filter array to merge. Any null
   *                  filter pointers will use the source bitmap instead.
   *  @param cropRect Optional rectangle that crops all input filters and the output.
   */
  MakeMerge(
    filters: Array<SkImageFilter | null>,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that produces the SkPicture as its output, clipped to both 'targetRect' and
   *  the picture's internal cull rect.
   *
   *  If 'pic' is null, the returned image filter produces transparent black.
   *
   *  @param picture    The picture that is drawn for the filter output.
   *  @param targetRect The drawing region for the picture. If null, the picture's bounds are used.
   */
  MakePicture(picture: SkPicture, targetRect?: SkRect | null): SkImageFilter;

  /**
   *  Create a filter that fills the output with the per-pixel evaluation of the SkShader produced
   *  by the SkRuntimeEffectBuilder. The shader is defined in the image filter's local coordinate
   *  system, so it will automatically be affected by SkCanvas' transform.
   *
   *  This requires a GPU backend or SkSL to be compiled in.
   *
   *  @param builder          The builder used to produce the runtime shader, that will in turn
   *                          fill the result image
   *  @param sampleRadius     defines the sampling radius of 'childShaderName' relative to
   *                          the runtime shader produced by 'builder'.
   *                          If greater than 0, the coordinate passed to childShader.eval() will
   *                          be up to 'sampleRadius' away (maximum absolute offset in 'x' or 'y')
   *                          from the coordinate passed into the runtime shader.
   *  @param childShaderNames The names of the child shaders defined in the builder that will be
   *                          bound to the input params (or the source image if the input param
   *                          is null). If any name is null, or appears more than once, factory
   *                          fails and returns nullptr.
   *  @param inputs           The image filters that will be provided as input to the runtime
   *                          shader. If any are null, the implicit source image is used instead.
   */
  MakeRuntimeShaderWithChildren: (
    builder: SkRuntimeShaderBuilder,
    sampleRadius: number,
    childShaderNames: string[],
    inputs: Array<SkImageFilter | null>
  ) => SkImageFilter;

  /**
   *  Create a tile image filter.
   *  @param src   Defines the pixels to tile
   *  @param dst   Defines the pixel region that the tiles will be drawn to
   *  @param input The input that will be tiled, if null the source bitmap is used instead.
   */
  MakeTile(
    src: SkRect,
    dst: SkRect,
    input?: SkImageFilter | null
  ): SkImageFilter;

  /**
   *  Create a filter that calculates the diffuse illumination from a distant light source,
   *  interpreting the alpha channel of the input as the height profile of the surface (to
   *  approximate normal vectors).
   *  @param direction    The direction to the distance light.
   *  @param lightColor   The color of the diffuse light source.
   *  @param surfaceScale Scale factor to transform from alpha values to physical height.
   *  @param kd           Diffuse reflectance coefficient.
   *  @param input        The input filter that defines surface normals (as alpha), or uses the
   *                      source bitmap when null.
   *  @param cropRect     Optional rectangle that crops the input and output.
   */
  MakeDistantLitDiffuse(
    direction: SkPoint3,
    lightColor: SkColor,
    surfaceScale: number,
    kd: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that calculates the diffuse illumination from a point light source, using
   *  alpha channel of the input as the height profile of the surface (to approximate normal
   *  vectors).
   *  @param location     The location of the point light.
   *  @param lightColor   The color of the diffuse light source.
   *  @param surfaceScale Scale factor to transform from alpha values to physical height.
   *  @param kd           Diffuse reflectance coefficient.
   *  @param input        The input filter that defines surface normals (as alpha), or uses the
   *                      source bitmap when null.
   *  @param cropRect     Optional rectangle that crops the input and output.
   */
  MakePointLitDiffuse(
    location: SkPoint3,
    lightColor: SkColor,
    surfaceScale: number,
    kd: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that calculates the diffuse illumination from a spot light source, using
   *  alpha channel of the input as the height profile of the surface (to approximate normal
   *  vectors). The spot light is restricted to be within 'cutoffAngle' of the vector between
   *  the location and target.
   *  @param location        The location of the spot light.
   *  @param target          The location that the spot light is point towards
   *  @param falloffExponent Exponential falloff parameter for illumination outside of cutoffAngle
   *  @param cutoffAngle     Maximum angle from lighting direction that receives full light
   *  @param lightColor      The color of the diffuse light source.
   *  @param surfaceScale    Scale factor to transform from alpha values to physical height.
   *  @param kd              Diffuse reflectance coefficient.
   *  @param input           The input filter that defines surface normals (as alpha), or uses the
   *                         source bitmap when null.
   *  @param cropRect        Optional rectangle that crops the input and output.
   */
  MakeSpotLitDiffuse(
    location: SkPoint3,
    target: SkPoint3,
    falloffExponent: number,
    cutoffAngle: number,
    lightColor: SkColor,
    surfaceScale: number,
    kd: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that calculates the specular illumination from a distant light source,
   *  interpreting the alpha channel of the input as the height profile of the surface (to
   *  approximate normal vectors).
   *  @param direction    The direction to the distance light.
   *  @param lightColor   The color of the specular light source.
   *  @param surfaceScale Scale factor to transform from alpha values to physical height.
   *  @param ks           Specular reflectance coefficient.
   *  @param shininess    The specular exponent determining how shiny the surface is.
   *  @param input        The input filter that defines surface normals (as alpha), or uses the
   *                      source bitmap when null.
   *  @param cropRect     Optional rectangle that crops the input and output.
   */
  MakeDistantLitSpecular(
    direction: SkPoint3,
    lightColor: SkColor,
    surfaceScale: number,
    ks: number,
    shininess: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that calculates the specular illumination from a point light source, using
   *  alpha channel of the input as the height profile of the surface (to approximate normal
   *  vectors).
   *  @param location     The location of the point light.
   *  @param lightColor   The color of the specular light source.
   *  @param surfaceScale Scale factor to transform from alpha values to physical height.
   *  @param ks           Specular reflectance coefficient.
   *  @param shininess    The specular exponent determining how shiny the surface is.
   *  @param input        The input filter that defines surface normals (as alpha), or uses the
   *                      source bitmap when null.
   *  @param cropRect     Optional rectangle that crops the input and output.
   */
  MakePointLitSpecular(
    location: SkPoint3,
    lightColor: SkColor,
    surfaceScale: number,
    ks: number,
    shininess: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;

  /**
   *  Create a filter that calculates the specular illumination from a spot light source, using
   *  alpha channel of the input as the height profile of the surface (to approximate normal
   *  vectors). The spot light is restricted to be within 'cutoffAngle' of the vector between
   *  the location and target.
   *  @param location        The location of the spot light.
   *  @param target          The location that the spot light is point towards
   *  @param falloffExponent Exponential falloff parameter for illumination outside of cutoffAngle
   *  @param cutoffAngle     Maximum angle from lighting direction that receives full light
   *  @param lightColor      The color of the specular light source.
   *  @param surfaceScale    Scale factor to transform from alpha values to physical height.
   *  @param ks              Specular reflectance coefficient.
   *  @param shininess       The specular exponent determining how shiny the surface is.
   *  @param input           The input filter that defines surface normals (as alpha), or uses the
   *                         source bitmap when null.
   *  @param cropRect        Optional rectangle that crops the input and output.
   */
  MakeSpotLitSpecular(
    location: SkPoint3,
    target: SkPoint3,
    falloffExponent: number,
    cutoffAngle: number,
    lightColor: SkColor,
    surfaceScale: number,
    ks: number,
    shininess: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter;
}

export type SkPoint3 = {
  x: number;
  y: number;
  z: number;
};
