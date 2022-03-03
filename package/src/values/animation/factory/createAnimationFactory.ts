import type { Value, AnimationState, Animation } from "../../types";
import { ValueApi } from "../../api";

import type { RequiredAnimationParams } from "./types";

/**
 * This function is used to create a new animation factory. An animation factory
 * is a function for creating specific types of animations like timings, springs etc.
 *
 * @param updateFunction This is the function that will be called with the
 * time value provided by the underlying clock. The function should return
 * the a transformed value between 0 and 1. Interpolation between
 * the "from" and "to" values provided in the parameters are handled by this function
 */
export const createAnimationFactory = <
  P extends RequiredAnimationParams = RequiredAnimationParams,
  S extends AnimationState = AnimationState
>(
  updateFunction: (t: number, params: P, state: S | undefined) => S
) => {
  return (params: P, value?: Value<number>): Animation => {
    // Update from to be either the declared from value,
    // the current value of the value or zero
    const resolvedParams = {
      ...params,
      from: params.from ?? value?.value ?? 0,
    } as P;

    // Update function for the animation value
    const upd = (
      t: number,
      state: ReturnType<typeof updateFunction> | undefined
    ) => {
      // Update the input value using the provided update function
      const nextState = updateFunction(t, resolvedParams, state);
      return {
        ...nextState,
        current:
          // Interpolate value
          nextState.current * (resolvedParams.to - resolvedParams.from!) +
          resolvedParams.from!,
      };
    };

    // Create animation value
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return ValueApi.createAnimation(upd);
  };
};
