import type { SkCanvas } from "./Canvas";
import type { SkRect } from "./Rect";

export interface SkSkottieAnimation {
  readonly duration: number;
  readonly fps: number;
  readonly seek: (time: number) => void;
  readonly render: (canvas: SkCanvas, rect: SkRect) => void;
}
