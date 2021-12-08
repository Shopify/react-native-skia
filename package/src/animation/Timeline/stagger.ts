import type { Animation } from "../types";
import { WrappedAnimationListImpl } from "../Animation";

export type StaggerParams = {
  delaySeconds?: number;
  staggerFunction?: (index: number, animations: Animation[]) => number;
};

/**
 * Plays a list of animations and use a stagger function to stagger their start time.
 * @param animations Animations to loop
 * @param params Stagger information
 * @returns The sequence animation
 */
export const stagger = (
  animations: Animation[],
  params?: StaggerParams
): Animation => {
  return new StaggeredAnimation(animations, params);
};

class StaggeredAnimation extends WrappedAnimationListImpl {
  constructor(animations: Animation[], params?: StaggerParams) {
    super(animations);
    this._params = params;
    this._delaySeconds = this.setupStagger(animations, params);
  }

  private _reversed = false;
  private _delaySeconds: number[];
  private _params: StaggerParams | undefined;

  private setupStagger(animations: Animation[], params?: StaggerParams) {
    return animations.map((_, i) => {
      if (params && params.staggerFunction) {
        return params.staggerFunction(i, animations);
      } else if (params && params.delaySeconds) {
        return params.delaySeconds * i;
      } else {
        return i * 100;
      }
    });
  }

  async start(): Promise<Animation> {
    this.assertAnimations();
    this._delaySeconds = this.setupStagger(this.animations, this._params);
    const promises: Array<Promise<Animation>> = [];
    for (let i = 0; i < this.animations.length; i++) {
      promises.push(
        new Promise<Animation>((resolve) => {
          setTimeout(() => {
            this.activeAnimationIndex = this._reversed
              ? this.animations.length - 1 - i
              : i;
            this._reversed
              ? this.activeAnimation.reverse().then(resolve)
              : this.activeAnimation.start().then(resolve);
          }, this._delaySeconds[i]);
        })
      );
    }
    await Promise.all(promises);
    return this;
  }

  reverse() {
    this._reversed = true;
    return this.start();
  }

  stop() {
    this.animations.forEach((animation) => animation.stop());
  }

  reset() {
    this._reversed = false;
    this.animations.forEach((animation) => animation.reset());
  }
}
