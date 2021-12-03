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

/**
 * Repeats the provided animation
 * @param animation Animation to loop
 * @param yoyo Wether it should invert it's output on each iteration
 * @returns The looped animation
 */
export const repeat = (
  animation: Animation,
  params?: { yoyo?: boolean; repeatCount?: 1 }
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
    this._reverse = false;
  }

  private readonly _yoyo: boolean;
  private readonly _repeatCount: number;

  private _iterations = 0;
  private _reverse: boolean;

  private startInternal(forward: boolean) {
    return (
      this._reverse ? this.animation.reverse() : this.animation.start()
    ).then(() => {
      if (this.animation.state?.done !== true) {
        // This animation was interrupted and then resolved.
        return this;
      }
      this._iterations++;
      if (
        this._repeatCount === Infinity ||
        this._iterations <= this._repeatCount
      ) {
        this.reset();
        return forward ? this.reverse() : this.start();
      } else {
        return Promise.resolve(this);
      }
    });
  }

  start(): Promise<Animation> {
    return this.startInternal(true);
  }

  reverse(): Promise<Animation> {
    this._reverse = this._yoyo && true;
    return this.startInternal(false);
  }

  stop() {
    this.animation.stop();
  }

  reset() {
    super.reset();
    this._reverse = false;
    this._iterations = 0; // TODO!!
  }
}
