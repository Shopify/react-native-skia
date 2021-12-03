import type { AnimationStateFactory } from "../functions/types";
import type {
  Animation,
  AnimationFunctionWithState,
  AnimationValue,
} from "../types";

import { AnimationImpl } from "./AnimationImp";

/**
 * Creates a new animation object
 * @param value Animation value to animate
 * @param fn Animation function for evaluating values
 * @param stateFactory Factory for creating the state of the animation
 * @returns Animation controller object.
 */
export const createAnimation = (
  value: AnimationValue<number>,
  fn: AnimationFunctionWithState,
  stateFactory: AnimationStateFactory
): Animation => {
  return new AnimationImpl(value, fn, stateFactory);
};
