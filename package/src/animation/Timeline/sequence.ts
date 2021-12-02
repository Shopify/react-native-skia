import type {
  Animation,
  AnimationFunctionWithState,
  AnimationValue,
} from "../types";
import type { BaseAnimationState } from "../functions";

/**
 * Plays a sequence of animations
 * @param animations Animations to loop
 * @returns The sequence animation
 */
export const sequence = (animations: Animation[]): Animation => {
  return new SequenceAnimation(animations);
};

class SequenceAnimation implements Animation {
  constructor(animations: Animation[]) {
    this._animations = animations;
    this._activeAnimationIndex = 0;
  }

  _animations: Animation[];
  _activeAnimationIndex: number;

  private assertAnimations() {
    console.assert(this._animations.length > 0, "No animations provided");
  }

  private get activeAnimation() {
    return this._animations[this._activeAnimationIndex];
  }

  public get value(): AnimationValue {
    this.assertAnimations();
    return this.activeAnimation.value;
  }

  public get state(): BaseAnimationState {
    this.assertAnimations();
    return this.activeAnimation.state;
  }

  public get evaluate(): AnimationFunctionWithState {
    this.assertAnimations();
    return this.activeAnimation.evaluate;
  }

  start(): Promise<void> {
    this.assertAnimations();
    // Let us start the first animation!
    return this.activeAnimation.start().then(() => {
      this._activeAnimationIndex++;
      if (this._activeAnimationIndex < this._animations.length) {
        return this.start();
      } else {
        return Promise.resolve();
      }
    });
  }

  restart() {
    this._activeAnimationIndex = 0;
    this.start();
  }
}
