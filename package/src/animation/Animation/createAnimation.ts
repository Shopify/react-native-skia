import type {
  Animation,
  AnimationStateFactory,
  AnimationFunctionWithState,
} from "../types";

import { AnimationImpl } from "./AnimationImp";

/**
 * Creates a new animation object
 * @param evaluator Animation evaluator function
 * @param stateFactory Animation State factory
 * @returns A new animation object
 */
export const createAnimation = (
  evaluator: AnimationFunctionWithState,
  stateFactory: AnimationStateFactory
): Animation => {
  return new AnimationImpl(evaluator, stateFactory);
};
