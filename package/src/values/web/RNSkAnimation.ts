import type { AnimationState, SkiaAnimation } from "../types";

import { RNSkClockValue } from "./RNSkClockValue";

export class RNSkAnimation<S extends AnimationState = AnimationState>
  extends RNSkClockValue
  implements SkiaAnimation
{
  constructor(
    callback: (t: number, state: S | undefined) => S,
    raf: (callback: (time: number) => void) => number
  ) {
    super(raf);
    this._callback = callback;
  }

  private _callback: (t: number, state: S | undefined) => S;
  private _animationState: S | undefined = undefined;

  public cancel() {
    this.stop();
  }

  protected update(nextValue: number): void {
    if (this._callback) {
      this._animationState = this._callback(nextValue, this._animationState);
      if (this._animationState?.finished) {
        this.stop();
      }
    }
    super.update(this._animationState?.current ?? nextValue);
  }
}
