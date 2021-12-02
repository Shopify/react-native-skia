import type { Animation } from "../types";
import { AnimationImpl } from "../Animation";

/**
 * Loops the provided animation
 * @param animation Animation to loop
 * @param yoyo Wether it should invert it's output on each iteration
 * @returns The looped animation
 */
export const loop = (animation: Animation, yoyo = false): Animation => {
  return new LoopingAnimation(animation, yoyo);
};

class LoopingAnimation extends AnimationImpl {
  constructor(animation: Animation, yoyo = false) {
    super(animation.value, animation.evaluate, animation.state);
    this._yoyo = yoyo;
    this._reverse = false;
  }

  _yoyo: boolean;
  _reverse: boolean;

  protected onAnimationEnd() {
    this._reverse = !this._reverse;
    this.restart();
  }

  protected onAnimationTick(t: number) {
    const retVal = this._reverse && this._yoyo ? 1 - t : t;
    return retVal;
  }
}
