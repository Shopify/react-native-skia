import type { SkImage } from "../Image";
import type { SkJSIInstance } from "../JsiInstance";
import type { SkMatrix } from "../Matrix";

export interface Video extends SkJSIInstance<"Video"> {
  duration(): number;
  framerate(): number;
  nextImage(): SkImage | null;
  seek(time: number): void;
  preferedMatrix(): SkMatrix;
}
