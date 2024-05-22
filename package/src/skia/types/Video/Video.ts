import type { SkImage } from "../Image";
import type { SkJSIInstance } from "../JsiInstance";

export interface Video extends SkJSIInstance<"Video"> {
  duration(): number;
  framerate(): number;
  nextImage(): SkImage | null;
  seek(time: number): void;
}
