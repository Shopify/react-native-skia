import type { Animation } from "../types";
import { WrappedAnimationImpl } from "../Animation";

/**
 * Delays starting the provided animation
 * @param animation Animation to delay
 * @param delaySeconds Delay in seconds
 * @returns The delayed animation
 */
export const delay = (
  animation: Animation,
  params?: { delaySeconds?: number }
): Animation => {
  return new DelayedAnimation(animation, params);
};

export class DelayedAnimation extends WrappedAnimationImpl {
  constructor(animation: Animation, params?: { delaySeconds?: number }) {
    super(animation);
    this._delaySeconds = params?.delaySeconds ?? 0;
    this._reversed = false;
  }

  private _reversed = false;
  private readonly _delaySeconds: number;

  private startInternal() {
    return new Promise<Animation>((resolve) => {
      const startOrReverse = (
        this._reversed ? this.animation.reverse : this.animation.start
      ).bind(this.animation);
      setTimeout(() => {
        startOrReverse().then(resolve);
      }, this._delaySeconds * 1000);
    });
  }

  start(): Promise<Animation> {
    return this.startInternal();
  }

  reverse(): Promise<Animation> {
    this._reversed = true;
    return this.startInternal();
  }

  stop() {
    this.animation.stop();
  }

  reset() {
    super.reset();
    this._reversed = false;
  }
}
