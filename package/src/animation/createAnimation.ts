import type { DrawingContext } from "../renderer/DrawingContext";

import type { BaseAnimationState } from "./functions/types";
import type { AnimationFunctionWithState, AnimationValue } from "./types";

export const createAnimation = <S extends BaseAnimationState, T = number>(
  value: AnimationValue<T>,
  fn: AnimationFunctionWithState<S, T>,
  state: S
) => {
  // Return the spring function to the AnimationValue
  const func = ({ timestamp }: DrawingContext) => {
    const retVal = fn(timestamp, state);
    if (state.done) {
      value.endAnimation();
    }
    return retVal;
  };

  // Start animation
  value.startAnimation(func);
};
