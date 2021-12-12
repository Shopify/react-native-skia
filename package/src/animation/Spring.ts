import type { SpringConfig } from "./functions";
import { createSpringEasing } from "./functions";
import { createSpring, runSpring } from "./Animation";

/*
  Spring animation configurations
*/
const Config = {
  Gentle: createSpringEasing({
    mass: 1,
    stiffness: 170,
    damping: 19,
  }),
  Wobbly: createSpringEasing({
    mass: 1,
    stiffness: 180,
    damping: 12,
  }),
  WobblySlow: createSpringEasing({
    mass: 4,
    stiffness: 180,
    damping: 25,
  }),
  Stiff: createSpringEasing({
    mass: 1,
    stiffness: 200,
    damping: 20,
  }),
  Default: createSpringEasing({
    mass: 1,
    stiffness: 100,
    damping: 10,
  }),
};

export const Spring = {
  create: createSpring,
  run: runSpring,
  Config,
  Gentle: (config: SpringConfig = {}) =>
    createSpringEasing({
      ...Config.Gentle,
      ...config,
    }),
  Wobbly: (config: SpringConfig = {}) =>
    createSpringEasing({
      ...Config.Wobbly,
      ...config,
    }),
  WobblySlow: (config: SpringConfig = {}) =>
    createSpringEasing({
      ...Config.WobblySlow,
      ...config,
    }),
  Stiff: (config: SpringConfig = {}) =>
    createSpringEasing({
      ...Config.Stiff,
      ...config,
    }),
  Default: (config: SpringConfig = {}) =>
    createSpringEasing({
      ...Config.Default,
      ...config,
    }),
};
