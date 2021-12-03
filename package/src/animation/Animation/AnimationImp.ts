import type {
  BaseAnimationState,
  AnimationStateFactory,
} from "../functions/types";
import type {
  Animation,
  AnimationFunction,
  AnimationFunctionWithState,
  AnimationValue,
} from "../types";

export class AnimationImpl implements Animation {
  constructor(
    animationValue: AnimationValue,
    fn: AnimationFunctionWithState,
    stateFactory: AnimationStateFactory
  ) {
    this._animationValue = animationValue;
    this._fn = fn;
    this._stateFactory = stateFactory;
    this._fnRunner = undefined;
    this._state = undefined;
  }

  private _animationValue: AnimationValue;
  private _fn: AnimationFunctionWithState;
  private _fnRunner: AnimationFunction | undefined;
  private _stateFactory: AnimationStateFactory;
  private _state: BaseAnimationState | undefined;
  private _prevState: BaseAnimationState | undefined;
  private _reversed = false;

  public get value(): AnimationValue {
    return this._animationValue;
  }

  public get state(): BaseAnimationState | undefined {
    return this._state;
  }

  public get evaluate(): AnimationFunctionWithState {
    return this._fn;
  }

  protected onAnimationTick(t: number): number {
    return t;
  }

  public reset() {
    this._reversed = false;
    this._prevState = this._state;
    this._state = undefined;
    this._fnRunner = undefined;
  }

  public start() {
    // Set from / value on state
    const prev = this._prevState?.from;
    this._state = this._stateFactory();

    // Handle resolving from when reversing an existing animation
    if (prev !== undefined) {
      this._state.from = prev;
      this._state.value = prev;
    }

    return new Promise<Animation>((resolve) => {
      if (this._fnRunner !== undefined) {
        this.reset();
      }

      // Return the spring function to the AnimationValue
      this._fnRunner = (timestampSeconds: number) => {
        const retVal = this._fn(timestampSeconds, this.state!);
        if (this.state?.done === true) {
          this.stop();
        }
        return this._reversed
          ? this.state!.to + this.state!.from - retVal
          : retVal;
      };
      this._animationValue.startAnimation(this._fnRunner!, () => {
        this._fnRunner = undefined;
        resolve(this);
      });
    });
  }

  public reverse() {
    this._reversed = true;
    return this.start();
  }

  public stop() {
    if (this._fnRunner !== undefined) {
      this._animationValue.endAnimation(this._fnRunner);
    }
  }
}
