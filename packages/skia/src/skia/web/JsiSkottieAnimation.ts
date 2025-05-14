import type { CanvasKit, SkottieAnimation } from "canvaskit-wasm";

import type { SkSkottieAnimation } from "../types/Skottie";

import { HostObject } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkottieAnimation
  extends HostObject<SkottieAnimation, "SkottieAnimation">
  implements SkSkottieAnimation
{
  constructor(CanvasKit: CanvasKit, ref: SkottieAnimation) {
    super(CanvasKit, ref, "SkottieAnimation");
  }
  duration(): number {
    return this.ref.duration();
  }
  fps(): number {
    return this.ref.fps();
  }
  render(canvas: JsiSkCanvas, dstRect?: JsiSkRect): void {
    this.ref.render(JsiSkCanvas.fromValue(canvas), dstRect?.ref);
  }
  seekFrame(frame: number, damageRect?: JsiSkRect): JsiSkRect {
    const damagedRect = damageRect?.ref ?? new Float32Array(4);
    this.ref.seekFrame(frame, damagedRect);
    return new JsiSkRect(this.CanvasKit, damagedRect);
  }
  size() {
    const [width, height] = this.ref.size();
    return { width, height };
  }
  version(): string {
    return this.ref.version();
  }
  dispose() {
    this.ref.delete();
  }
}
