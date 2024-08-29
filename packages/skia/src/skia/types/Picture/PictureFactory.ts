import type { SkPicture } from "./Picture";

export interface PictureFactory {
  /**
   * Returns an SkPicture which has been serialized previously to the given bytes.
   * @param bytes
   */
  MakePicture(bytes: Uint8Array | ArrayBuffer): SkPicture | null;
}
