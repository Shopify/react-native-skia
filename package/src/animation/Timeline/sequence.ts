import type { Animation } from "../types";
import { WrappedAnimationListImpl } from "../Animation";

/**
 * Plays a sequence of animations one after another
 * @param animations Animations to loop
 * @returns The sequence animation
 */
export const sequence = (animations: Animation[]): Animation => {
  return new SequenceAnimation(animations);
};

class SequenceAnimation extends WrappedAnimationListImpl {
  constructor(animations: Animation[]) {
    super(animations);
  }

  private _reversed = false;

  async start(): Promise<Animation> {
    this.assertAnimations();
    for (let i = 0; i < this.animations.length; i++) {
      await (this._reversed
        ? this.activeAnimation.reverse()
        : this.activeAnimation.start());

      if (this.activeAnimation.state?.done !== true) {
        // Animation was interrupted and therefore we should stop
        break;
      }
      // Do not go the the next animation if we're already done.
      if (i === this.animations.length - 1) {
        break;
      }
      this._reversed
        ? this.activeAnimationIndex--
        : this.activeAnimationIndex++;
    }
    return this;
  }

  reverse() {
    this._reversed = true;
    this.activeAnimationIndex = this.count - 1;
    return this.start();
  }

  stop() {
    this.animations.forEach((animation) => animation.stop());
  }

  reset() {
    this.activeAnimationIndex = 0;
    this._reversed = false;
    this.animations.forEach((animation) => animation.reset());
  }
}
