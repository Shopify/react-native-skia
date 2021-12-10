import { Value } from "../Value";
import type { AnimationState } from "../functions/types";
import type {
  Animation,
  AnimationFunctionWithState,
  AnimationStateFactory,
  AnimationValue,
} from "../types";

export class AnimationImpl implements Animation {
  constructor(
    evaluator: AnimationFunctionWithState,
    stateFactory: AnimationStateFactory
  ) {
    this._evaluator = evaluator;
    this._stateFactory = stateFactory;
    this._state = undefined;
  }

  private _evaluator: AnimationFunctionWithState;
  private _stateFactory: AnimationStateFactory;
  private _state: AnimationState | undefined;
  private _prevState: AnimationState | undefined;
  private _currentValue: AnimationValue<number> | undefined = undefined;

  public evaluate(timestampSeconds: number) {
    if (this._state !== undefined) {
      const retVal = this._evaluator(timestampSeconds, this._state);
      if (this._state.done) {
        this.stop();
      }
      return retVal;
    } else {
      return 0;
    }
  }

  private reset() {
    this._prevState = this._state;
    this._state = undefined;
  }

  public get duration(): number {
    return this._stateFactory(0).duration;
  }

  public _begin(start: number) {
    this.reset();

    // Set from / value on state
    const prev = this._prevState?.from;
    this._state = this._stateFactory(start);

    // Handle resolving from when reversing an existing animation
    if (prev !== undefined) {
      this._state.from = prev;
      this._state.value = prev;
    }
    return this;
  }

  public start(animationValue?: AnimationValue<number>): Promise<Animation> {
    this._currentValue = animationValue || Value.create(0);
    this._begin(this._currentValue.value);

    return new Promise<Animation>((resolve) => {
      this._currentValue!.startAnimation(this, () => {
        resolve(this);
      });
    });
  }

  public stop() {
    if (this._currentValue !== undefined) {
      this._currentValue.stopAnimation(this);
    }
  }

  public active() {
    return this._currentValue !== undefined;
  }
}
