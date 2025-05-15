import type { CanvasKit, ManagedSkottieAnimation } from "canvaskit-wasm";

import type {
  AnimationMarker,
  ColorProperty,
  OpacityProperty,
  SkSkottieAnimation,
  TextProperty,
  TransformProperty,
} from "../types/Skottie";
import type { SkColor } from "../types";

import { HostObject } from "./Host";
import type { JsiSkCanvas } from "./JsiSkCanvas";
import type { JsiSkRect } from "./JsiSkRect";
import { JsiSkPoint } from "./JsiSkPoint";
import { Color } from "./JsiSkColor";

export class JsiSkottieAnimation
  extends HostObject<ManagedSkottieAnimation, "SkottieAnimation">
  implements SkSkottieAnimation
{
  constructor(CanvasKit: CanvasKit, ref: ManagedSkottieAnimation) {
    super(CanvasKit, ref, "SkottieAnimation");
  }
  setColor(key: string, color: SkColor) {
    return this.ref.setColor(key, color);
  }
  setOpacity(key: string, opacity: number) {
    return this.ref.setOpacity(key, opacity);
  }
  setText(key: string, text: string, size: number) {
    return this.ref.setText(key, text, size);
  }
  setTransform(
    key: string,
    anchor: JsiSkPoint,
    position: JsiSkPoint,
    scale: JsiSkPoint,
    rotation: number,
    skew: number,
    skewAxis: number
  ) {
    return this.ref.setTransform(
      key,
      anchor.ref,
      position.ref,
      scale.ref,
      rotation,
      skew,
      skewAxis
    );
  }
  getMarkers(): AnimationMarker[] {
    return this.ref.getMarkers();
  }
  getColorProps(): ColorProperty[] {
    return this.ref
      .getColorProps()
      .map(({ key, value }) => ({ key, value: Color(value) }));
  }
  getOpacityProps(): OpacityProperty[] {
    return this.ref.getOpacityProps();
  }
  getTextProps(): TextProperty[] {
    return this.ref.getTextProps();
  }
  getTransformProps(): TransformProperty[] {
    return this.ref
      .getTransformProps()
      .map(
        ({
          key,
          value: {
            anchor,
            position,
            scale,
            rotation,
            skew,
            skew_axis: skewAxis,
          },
        }) => {
          return {
            key,
            value: {
              anchor: new JsiSkPoint(this.CanvasKit, anchor),
              position: new JsiSkPoint(this.CanvasKit, position),
              scale: new JsiSkPoint(this.CanvasKit, scale),
              rotation,
              skew,
              skewAxis,
            },
          };
        }
      );
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
