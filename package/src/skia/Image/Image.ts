/*global SkiaApi*/
import type { ImageSourcePropType } from "react-native";

import type { TileMode } from "../ImageFilter";
import type { IShader } from "../Shader";
import type { Matrix } from "../Matrix";
import type { SkJSIInstance } from "../JsiInstance";

const resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");

export enum FilterMode {
  Linear,
  Nearest,
}

export enum MipmapMode {
  None,
  Nearest,
  Linear,
}

export interface IImage extends SkJSIInstance<"Image"> {
  /**
   * Returns the possibly scaled height of the image.
   */
  height(): number;

  /**
   * Returns the possibly scaled width of the image.
   */
  width(): number;

  /**
   * Returns this image as a shader with the specified tiling. It will use cubic sampling.
   * @param tx - tile mode in the x direction.
   * @param ty - tile mode in the y direction.
   * @param fm - The filter mode. (default nearest)
   * @param mm - The mipmap mode. Note: for settings other than None, the image must have mipmaps (default none)
   *             calculated with makeCopyWithDefaultMipmaps;
   * @param localMatrix
   */
  makeShaderOptions(
    tx: TileMode,
    ty: TileMode,
    fm: FilterMode,
    mm: MipmapMode,
    localMatrix?: Matrix
  ): IShader;

  /**
   * Returns this image as a shader with the specified tiling. It will use cubic sampling.
   * @param tx - tile mode in the x direction.
   * @param ty - tile mode in the y direction.
   * @param B - See CubicResampler in SkSamplingOptions.h for more information
   * @param C - See CubicResampler in SkSamplingOptions.h for more information
   * @param localMatrix
   */
  makeShaderCubic(
    tx: TileMode,
    ty: TileMode,
    B: number,
    C: number,
    localMatrix?: Matrix
  ): IShader;

  /** Encodes SkImage pixels, returning result as UInt8Array. Returns existing
     encoded data if present; otherwise, SkImage is encoded with
     SkEncodedImageFormat::kPNG. Skia must be built with SK_ENCODE_PNG to encode
     SkImage.

    Returns nullptr if existing encoded data is missing or invalid, and
    encoding fails.

    @return  Uint8Array with data
  */
  toByteData(): Uint8Array;

  /** Encodes SkImage pixels, returning result as base 64 encoded string. Returns existing
     encoded data if present; otherwise, SkImage is encoded with
     SkEncodedImageFormat::kPNG. Skia must be built with SK_ENCODE_PNG to encode
     SkImage.

    Returns nullptr if existing encoded data is missing or invalid, and
    encoding fails.

    @return  base64 encoded string of data
  */
  toBase64(): string;
}

export const ImageCtor = (image: ImageSourcePropType) => {
  const asset = resolveAssetSource(image);
  return SkiaApi.Image(asset.uri);
};
