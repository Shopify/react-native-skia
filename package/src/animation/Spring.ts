import type { SpringConfig } from "./functions";
import { createSpringEasing } from "./functions";
import { createSpring, runSpring } from "./Animation";

/*
  Spring animation namespace
*/
export const Spring = {
  create: createSpring,
  run: runSpring,
  Gentle: (config: SpringConfig = {}) =>
    createSpringEasing({
      mass: 1,
      stiffness: 170,
      damping: 19,
      ...config,
    }),
  Wobbly: (config: SpringConfig = {}) =>
    createSpringEasing({
      mass: 1,
      stiffness: 180,
      damping: 12,
      ...config,
    }),
  WobblySlow: (config: SpringConfig = {}) =>
    createSpringEasing({
      mass: 4,
      stiffness: 180,
      damping: 25,
      ...config,
    }),
  Stiff: (config: SpringConfig = {}) =>
    createSpringEasing({
      mass: 1,
      stiffness: 200,
      damping: 20,
      ...config,
    }),
  Default: (config: SpringConfig = {}) =>
    createSpringEasing({
      mass: 1,
      stiffness: 100,
      damping: 10,
      ...config,
    }),
};
