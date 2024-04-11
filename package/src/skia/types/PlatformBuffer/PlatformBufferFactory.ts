import type { SkImage } from "../Image";

export type PlatformBuffer = bigint;

export interface PlatformBufferFactory {
  /**
   * Copy pixels to a platform buffer. (for testing purposes)
   */
  MakeFromImage: (image: SkImage) => PlatformBuffer;
  /**
   * Release a platform buffer that was created with `MakeFromImage`.
   */
  Release: (platformBuffer: PlatformBuffer) => void;
}
