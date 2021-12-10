import type { AnimationValue } from "./types";
import type { SpringConfig } from "./functions";
import { createSpringEasing } from "./functions";
import { Timing } from "./Timing";

export interface SpringParams {
  from?: number;
  to?: number;
  config?: SpringConfig;
}

/**
 * Starts a spring animation where the animationValue will be updated with the
 * current value of the spring function with the spring parameters.
 * @param animationValue Value to be updated
 * @param params Spring parameters
 * @returns A function that can be called from the drawing loop
 */
const run = (animationValue: AnimationValue<number>, params: SpringParams) => {
  return create(params).start(animationValue);
};

/**
 * Creates a spring animation with the spring parameters.
 * @param params Spring parameters
 * @returns A spring animation object
 */
export const create = (params: SpringParams) => {
  const springEasing = createSpringEasing(params.config ?? {});
  return Timing.create({
    duration: springEasing.duration,
    easing: springEasing.solver,
    from: params.from,
    to: params.to,
  });
};

export const Spring = {
  run,
  create,
  Spring: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 100,
    damping: 26,
    ...config,
  }),
  Gentle: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 170,
    damping: 19,
    ...config,
  }),
  Wobbly: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 180,
    damping: 12,
    ...config,
  }),
  WobblySlow: (config: SpringConfig = {}) => ({
    mass: 4,
    stiffness: 180,
    damping: 25,
    ...config,
  }),
  Stiff: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 200,
    damping: 20,
    ...config,
  }),
  Default: (config: SpringConfig = {}) => ({
    mass: 1,
    stiffness: 100,
    damping: 10,
    ...config,
  }),
};
