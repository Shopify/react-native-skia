import type { BaseAnimationState } from "../functions/types";
import type { Animation, AnimationValue } from "../types";

export class WrappedAnimationListImpl implements Animation {
  constructor(animations: Animation[]) {
    this._animations = animations;
  }

  private _animations: Array<Animation>;
  private _activeAnimationIndex = 0;

  protected assertAnimations() {
    console.assert(this._animations.length > 0, "No animations provided");
  }

  protected get activeAnimation() {
    this.assertAnimations();
    return this._animations[this._activeAnimationIndex];
  }

  protected get animations() {
    return this._animations;
  }

  protected get count() {
    return this._animations.length;
  }

  protected get activeAnimationIndex() {
    return this._activeAnimationIndex;
  }

  protected set activeAnimationIndex(value: number) {
    console.assert(value < this.count, "Animation index is out of bounds.");
    this._activeAnimationIndex = value;
  }

  public get value(): AnimationValue {
    return this.activeAnimation.value;
  }

  public get state(): BaseAnimationState | undefined {
    return this.activeAnimation.state;
  }

  start(): Promise<Animation> {
    return this.activeAnimation.start();
  }

  reverse() {
    return this.activeAnimation.reverse();
  }

  stop() {
    this.activeAnimation.stop();
  }

  reset() {
    this.activeAnimation.reset();
  }
}
