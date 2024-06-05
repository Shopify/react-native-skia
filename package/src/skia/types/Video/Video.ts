import type { SkImage } from "../Image";
import type { SkJSIInstance } from "../JsiInstance";

export type VideoRotation = 0 | 90 | 180 | 270;

export interface Video extends SkJSIInstance<"Video"> {
  duration(): number;
  framerate(): number;
  nextImage(): SkImage | null;
  seek(time: number): void;
  getRotationInDegrees(): VideoRotation;
  size(): { width: number; height: number };
}
