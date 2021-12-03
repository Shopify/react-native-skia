import type { Animation } from "../types";
import { WrappedAnimationListImpl } from "../Animation";

/**
 * Plays a list of animations at the same time
 * @param animations Animations to loop
 * @returns The sequence animation
 */
export const parallel = (animations: Animation[]): Animation => {
  return new ParallelAnimation(animations);
};

class ParallelAnimation extends WrappedAnimationListImpl {
  constructor(animations: Animation[]) {
    super(animations);
  }

  private _reversed = false;

  async start(): Promise<Animation> {
    this.assertAnimations();
    const promises: Array<Promise<Animation>> = [];
    for (let i = 0; i < this.animations.length; i++) {
      this.activeAnimationIndex = i;
      promises.push(
        this._reversed
          ? this.activeAnimation.reverse()
          : this.activeAnimation.start()
      );
    }
    await Promise.all(promises);
    return this;
  }

  reverse() {
    this._reversed = true;
    return this.start();
  }

  stop() {
    this.animations.forEach((animation) => animation.stop());
  }

  reset() {
    this._reversed = false;
    this.animations.forEach((animation) => animation.reset());
  }
}
