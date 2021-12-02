import type { BaseAnimationState } from "./functions/types";
import type {
  Animation,
  AnimationFunction,
  AnimationFunctionWithState,
  AnimationValue,
} from "./types";

/**
 * Creates a new animation object
 * @param value Animation value to animate
 * @param fn Animation function for evaluating values
 * @param state State of the animation
 * @returns Animation controller object.
 */
export const createAnimation = (
  value: AnimationValue<number>,
  fn: AnimationFunctionWithState,
  state: BaseAnimationState
): Animation => {
  return new AnimationImpl(value, fn, state);
};

export class AnimationImpl implements Animation {
  constructor(
    animationValue: AnimationValue,
    fn: AnimationFunctionWithState,
    state: BaseAnimationState
  ) {
    this._animationValue = animationValue;
    this._fn = fn;
    this._state = state;
    this._initialState = { ...state };
    this._fnRunner = undefined;
  }

  _animationValue: AnimationValue;
  _fn: AnimationFunctionWithState;
  _fnRunner: AnimationFunction | undefined;
  _state: BaseAnimationState;
  _initialState: BaseAnimationState;

  public get value(): AnimationValue {
    return this._animationValue;
  }

  public get state(): BaseAnimationState {
    return this._state;
  }

  public get evaluate(): AnimationFunctionWithState {
    return this._fn;
  }

  protected onAnimationEnd() {
    this.stop();
  }

  protected onAnimationTick(t: number): number {
    return t;
  }

  public restart = () => {
    this._state = { ...this._initialState };
    this._fnRunner = undefined;
    return this.start();
  };

  public start = () => {
    return new Promise<void>((resolve, reject) => {
      if (this._fnRunner !== undefined) {
        reject("Animation is already running. Use restart() instead of start.");
        return;
      }
      // Return the spring function to the AnimationValue
      this._fnRunner = (timestampSeconds: number) => {
        let retVal = this._fn(timestampSeconds, this._state);
        retVal = this.onAnimationTick(retVal);
        if (this._state.done) {
          this.onAnimationEnd();
        }
        return retVal;
      };
      this._animationValue.startAnimation(this._fnRunner!, () => {
        this._fnRunner = undefined;
        resolve();
      });
    });
  };

  public stop = () => {
    if (this._fnRunner !== undefined) {
      this._animationValue.endAnimation(this._fnRunner);
    }
  };
}
