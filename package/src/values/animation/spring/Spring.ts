import type { SpringConfig } from "./types";

/*
  Spring animation configurations
*/
const Config = {
  Gentle: {
    mass: 1,
    stiffness: 170,
    damping: 19,
    velocity: 0,
  },
  Wobbly: {
    mass: 1,
    stiffness: 180,
    damping: 12,
    velocity: 0,
  },
  WobblySlow: {
    mass: 4,
    stiffness: 180,
    damping: 25,
    velocity: 0,
  },
  Stiff: {
    mass: 1,
    stiffness: 200,
    damping: 20,
    velocity: 0,
  },
  Default: {
    mass: 1,
    stiffness: 100,
    damping: 10,
    velocity: 0,
  },
};

export const Spring = {
  Config,
  Gentle: (config: SpringConfig = {}) => ({
    ...Config.Gentle,
    ...config,
  }),
  Wobbly: (config: SpringConfig = {}) => ({
    ...Config.Wobbly,
    ...config,
  }),
  WobblySlow: (config: SpringConfig = {}) => ({
    ...Config.WobblySlow,
    ...config,
  }),
  Stiff: (config: SpringConfig = {}) => ({
    ...Config.Stiff,
    ...config,
  }),
  Default: (config: SpringConfig = {}) => ({
    ...Config.Default,
    ...config,
  }),
};
