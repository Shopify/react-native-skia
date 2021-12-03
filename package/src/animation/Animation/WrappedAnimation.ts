import type { BaseAnimationState } from "../functions/types";
import type { Animation, AnimationValue } from "../types";

export class WrappedAnimationImpl implements Animation {
  constructor(animation: Animation) {
    this._animation = animation;
  }

  private _animation: Animation;

  public get animation(): Animation {
    return this._animation;
  }

  public get value(): AnimationValue {
    return this._animation.value;
  }

  public get state(): BaseAnimationState | undefined {
    return this._animation.state;
  }

  start(): Promise<Animation> {
    return this._animation.start();
  }

  reverse() {
    return this._animation.reverse();
  }

  stop() {
    this._animation.stop();
  }

  reset() {
    this._animation.reset();
  }
}
