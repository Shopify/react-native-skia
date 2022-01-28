import type { Data } from "../Data";

import type { IImage } from "./Image";

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
  MakeImageFromEncoded: (encoded: Data) => IImage | null;
}
