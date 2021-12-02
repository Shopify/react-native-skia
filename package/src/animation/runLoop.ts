import type { AnimationValue } from "./types";
import type { BaseAnimationState } from "./functions/types";
import { normalize, lerp } from "./functions";
import type { TimingConfig } from "./functions";
import { createAnimation } from "./createAnimation";

export const runLoop = (
  animationValue: AnimationValue,
  config?: TimingConfig & { yoyo?: boolean }
) => {
  const duration = config?.duration ?? 1000;
  const yoyo = config?.yoyo ?? false;
  const easing = config?.easing ?? ((t: number) => t);

  const state: BaseAnimationState = {
    from: config?.from ?? 0,
    to: config?.to ?? 1,
    done: false,
    value: 0,
  };

  const func = (timestamp: number, s: BaseAnimationState) => {
    const t = timestamp * 1000;
    const progress = lerp(normalize(t, duration), s.from, s.to);
    const currentIteration = Math.floor(t / duration);
    const isGoingBack = currentIteration % 2 === 0;
    s.value = easing(isGoingBack && yoyo ? 1 - progress : progress);
    return s.value;
  };

  createAnimation(animationValue, func, state);
};
