import type { CanvasKit, ManagedSkottieAnimation } from "canvaskit-wasm";

import type {
  SkSkottieAnimation,
  SlotInfo,
  SlottableTextProperty,
} from "../types/Skottie";
import type { SkColor, SkPoint } from "../types";

import { HostObject } from "./Host";
import type { JsiSkCanvas } from "./JsiSkCanvas";
import type { JsiSkRect } from "./JsiSkRect";
import { JsiSkPoint } from "./JsiSkPoint";

export class JsiSkottieAnimation
  extends HostObject<ManagedSkottieAnimation, "SkottieAnimation">
  implements SkSkottieAnimation
{
  constructor(CanvasKit: CanvasKit, ref: ManagedSkottieAnimation) {
    super(CanvasKit, ref, "SkottieAnimation");
  }
  getSlotInfo(): SlotInfo {
    return this.ref.getSlotInfo();
  }
  setColorSlot(key: string, color: SkColor) {
    return this.ref.setColorSlot(key, color);
  }
  setScalarSlot(key: string, scalar: number) {
    return this.ref.setScalarSlot(key, scalar);
  }
  setVec2Slot(key: string, vec2: JsiSkPoint) {
    return this.ref.setVec2Slot(key, vec2.ref);
  }
  setTextSlot(_key: string, _text: SlottableTextProperty): boolean {
    throw new Error("Method not implemented.");
    // return this.ref.setTextSlot(key, text);
  }
  setImageSlot(key: string, assetName: string) {
    return this.ref.setImageSlot(key, assetName);
  }
  getColorSlot(key: string): SkColor | null {
    const color = this.ref.getColorSlot(key);
    return color;
  }
  getScalarSlot(key: string) {
    return this.ref.getScalarSlot(key);
  }
  getVec2Slot(key: string): SkPoint | null {
    const vec2 = this.ref.getVec2Slot(key);
    if (!vec2) {
      return null;
    }
    return new JsiSkPoint(this.CanvasKit, vec2);
  }
  getTextSlot(_key: string): SlottableTextProperty | null {
    throw new Error("Method not implemented.");
  }

  duration() {
    return this.ref.duration();
  }
  fps() {
    return this.ref.fps();
  }
  render(canvas: JsiSkCanvas, dstRect?: JsiSkRect) {
    const [width, height] = this.ref.size();
    this.ref.render(
      canvas.ref,
      dstRect?.ref ?? Float32Array.of(0, 0, width, height)
    );
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
  version() {
    return this.ref.version();
  }
  dispose() {
    this.ref.delete();
  }
}
