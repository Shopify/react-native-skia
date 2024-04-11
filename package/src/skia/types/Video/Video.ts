import type { SkImage } from "../Image";
import type { SkJSIInstance } from "../JsiInstance";

export interface Video extends SkJSIInstance<"Video"> {
  nextImage(timestamp: number): SkImage;
}
