import type { SkData } from "../Data";
import type { NativeBuffer } from "../NativeBuffer";

import type { SkImage } from "./Image";

export enum AlphaType {
  Unknown,
  Opaque,
  Premul,
  Unpremul,
}

export enum ColorType {
  Unknown, // uninitialized
  Alpha_8, // pixel with alpha in 8-bit byte
  RGB_565, // pixel with 5 bits red, 6 bits green, 5 bits blue, in 16-bit word
  ARGB_4444, // pixel with 4 bits for alpha, red, green, blue; in 16-bit word
  RGBA_8888, // pixel with 8 bits for red, green, blue, alpha; in 32-bit word
  RGB_888x, // pixel with 8 bits each for red, green, blue; in 32-bit word
  BGRA_8888, // pixel with 8 bits for blue, green, red, alpha; in 32-bit word
  RGBA_1010102, // 10 bits for red, green, blue; 2 bits for alpha; in 32-bit word
  BGRA_1010102, // 10 bits for blue, green, red; 2 bits for alpha; in 32-bit word
  RGB_101010x, // pixel with 10 bits each for red, green, blue; in 32-bit word
  BGR_101010x, // pixel with 10 bits each for blue, green, red; in 32-bit word
  BGR_101010x_XR, // pixel with 10 bits each for blue, green, red; in 32-bit word, extended range
  RGBA_10x6, // pixel with 10 used bits (most significant) followed by 6 unused
  Gray_8, // pixel with grayscale level in 8-bit byte
  RGBA_F16Norm, // pixel with half floats in [0,1] for red, green, blue, alpha; in 64-bit word
  RGBA_F16, // pixel with half floats for red, green, blue, alpha; in 64-bit word
  RGBA_F32, // pixel using C float for red, green, blue, alpha; in 128-bit word
}

export interface ImageInfo {
  alphaType: AlphaType;
  // TODO: add support for color space
  // colorSpace: ColorSpace;
  colorType: ColorType;
  height: number;
  width: number;
}

export interface ImageFactory {
  /**
   * Return an Image backed by the encoded data, but attempt to defer decoding until the image
   * is actually used/drawn. This deferral allows the system to cache the result, either on the
   * CPU or on the GPU, depending on where the image is drawn.
   * This decoding uses the codecs that have been compiled into CanvasKit. If the bytes are
   * invalid (or an unrecognized codec), null will be returned. See Image.h for more details.
   * @param data - Data object with bytes of data
   * @returns If the encoded format is not supported, or subset is outside of the bounds of the decoded
   *  image, nullptr is returned.
   */
  MakeImageFromEncoded: (encoded: SkData) => SkImage | null;

  /**
   * Return an Image backed by a given native buffer.
   * The native buffer must be a valid owning reference.
   *
   * For instance, this API is used by
   * [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera)
   * to render a Skia Camera preview.
   *
   * - On Android; This is an `AHardwareBuffer*`
   * - On iOS, this is a `CVPixelBufferRef`
   * @param nativeBuffer A strong `uintptr_t` pointer to the native buffer
   * @throws Throws an error if the Image could not be created, for example when the given
   * native buffer is invalid.
   */
  MakeImageFromNativeBuffer: (nativeBuffer: NativeBuffer) => SkImage;

  /**
   * Returns an image that will be a screenshot of the view represented by
   * the view tag
   * @param viewTag - The tag of the view to make an image from.
   * @returns Returns a valid SkImage, if the view tag is invalid, nullptr is returned.
   */
  MakeImageFromViewTag: (viewTag: number) => Promise<SkImage | null>;

  /**
   * Returns an image with the given pixel data and format.
   * Note that we will always make a copy of the pixel data, because of inconsistencies in
   * behavior between GPU and CPU (i.e. the pixel data will be turned into a GPU texture and
   * not modifiable after creation).
   *
   * @param info
   * @param data - bytes representing the pixel data.
   * @param bytesPerRow
   */
  MakeImage(info: ImageInfo, data: SkData, bytesPerRow: number): SkImage | null;
}
