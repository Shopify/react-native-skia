import type { CanvasKit, SkottieAnimation } from "canvaskit-wasm";

import type { SkSkottieAnimation } from "../types/Skottie";

import { HostObject } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import type { JsiSkRect } from "./JsiSkRect";

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
  seekFrame(frame: number, damageRect?: JsiSkRect) {
    const result = this.ref.seekFrame(frame);
    if (damageRect) {
      damageRect.ref[0] = result[0];
      damageRect.ref[1] = result[1];
      damageRect.ref[2] = result[2];
      damageRect.ref[3] = result[3];
    }
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
