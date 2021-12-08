import type { Animation } from "../types";
import { WrappedAnimationImpl } from "../Animation";

/**
 * Loops the provided animation
 * @param animation Animation to loop
 * @param yoyo Wether it should invert it's output on each iteration
 * @returns The looped animation
 */
export const loop = (
  animation: Animation,
  params?: { yoyo?: boolean; repeatCount?: number }
): Animation => {
  return new RepeatingAnimation(animation, params);
};

export class RepeatingAnimation extends WrappedAnimationImpl {
  constructor(
    animation: Animation,
    params?: { yoyo?: boolean; repeatCount?: number }
  ) {
    super(animation);
    this._yoyo = params?.yoyo ?? false;
    this._repeatCount = params?.repeatCount ?? Infinity;
  }

  private readonly _yoyo: boolean;
  private readonly _repeatCount: number;

  private _iterations = 0;

  private startInternal(forward: boolean): Promise<Animation> {
    return (forward ? this.animation.start() : this.animation.reverse()).then(
      () => {
        if (this.animation.state?.done !== true) {
          // This animation was interrupted and then resolved.
          return this;
        }
        this._iterations++;
        if (
          this._repeatCount === Infinity ||
          this._iterations <= this._repeatCount - 1
        ) {
          this.reset();
          return this.startInternal(this._yoyo ? !forward : forward);
        } else {
          return Promise.resolve(this);
        }
      }
    );
  }

  start(): Promise<Animation> {
    return this.startInternal(true);
  }

  reverse(): Promise<Animation> {
    return this.startInternal(false);
  }

  stop() {
    this.animation.stop();
    this._iterations = 0;
  }

  reset() {
    super.reset();
  }
}
