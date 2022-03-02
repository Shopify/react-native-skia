import type { Value, ControllableValue } from "../../types";
import { ValueApi } from "../../api";

import type { RequiredAnimationParams } from "./types";

/**
 * This function is used to create a new animation factory for creating
 * animations that transforms the clock time into animated values.
 *
 * @param updateFunction This is the function that will be called with the
 * time value provided by the underlying clock. The function should return
 * the a transformed value between 0 and 1. This factory will then interpolate
 * the value between the "from" and "to" values provided in the parameters
 * passed to the return function.
 */
export const createAnimationFactory = <T extends RequiredAnimationParams>(
  updateFunction: (t: number, params: T, stop: () => void) => number
): ((
  params: RequiredAnimationParams,
  value?: Value<number>
) => ControllableValue) => {
  return (params: RequiredAnimationParams, value?: Value<number>) => {
    // Update from to be either the declared from value,
    // the current value of the value or zero
    const resolvedParams = {
      ...params,
      from: params.from ?? value?.value ?? 0,
    } as T;

    // Update function for the animation value
    const upd = (t: number, stop: () => void) => {
      if (resolvedParams.to === resolvedParams.from) {
        stop();
      }
      // Update the input value using the provided update function
      const p = updateFunction(t, resolvedParams, stop);
      // Interpolate the value
      return (
        p * (resolvedParams.to - resolvedParams.from!) + resolvedParams.from!
      );
    };

    // Create animation value
    return ValueApi.createAnimation(upd, value);
  };
};
