import type { AnimatedImage, CanvasKit } from "canvaskit-wasm";

import type { SkAnimatedImage } from "../types/AnimatedImage";

import { HostObject } from "./Host";
import { JsiSkImage } from "./JsiSkImage";

export class JsiSkAnimatedImage
  extends HostObject<AnimatedImage, "AnimatedImage">
  implements SkAnimatedImage
{
  constructor(CanvasKit: CanvasKit, ref: AnimatedImage) {
    super(CanvasKit, ref, "AnimatedImage");
  }

  decodeNextFrame() {
    return this.ref.decodeNextFrame();
  }

  currentFrameDuration() {
    return this.ref.currentFrameDuration();
  }

  getFrameCount() {
    return this.ref.getFrameCount();
  }

  getCurrentFrame() {
    const image = this.ref.makeImageAtCurrentFrame();
    if (image === null) {
      return null;
    }
    return new JsiSkImage(this.CanvasKit, image);
  }

  dispose = () => {
    this.ref.delete();
  };
}
