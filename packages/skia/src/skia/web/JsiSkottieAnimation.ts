import type { CanvasKit, SkottieAnimation } from "canvaskit-wasm";

import type { SkSkottieAnimation } from "../types/Skottie";

import { HostObject } from "./Host";
import { JsiSkPoint } from "./JsiSkPoint";
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
  seek(t: number, damageRect?: JsiSkRect): JsiSkRect {
    const result = this.ref.seek(t, damageRect?.ref);
    return new JsiSkRect(this.CanvasKit, result);
  }
  seekFrame(frame: number, damageRect?: JsiSkRect): JsiSkRect {
    const result = this.ref.seekFrame(frame, damageRect?.ref);
    return new JsiSkRect(this.CanvasKit, result);
  }
  size() {
    const size = this.ref.size();
    return new JsiSkPoint(this.CanvasKit, size);
  }
  version(): string {
    return this.ref.version();
  }
  dispose() {
    this.ref.delete();
  }
}
