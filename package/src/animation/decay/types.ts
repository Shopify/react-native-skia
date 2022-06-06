import type { AnimationState } from "../../values/types";

export interface DecayConfig {
  from?: number;
  deceleration?: number;
  velocityFactor?: number;
  clamp?: number[];
  velocity?: number;
}

export interface DefaultDecayConfig {
  from: number;
  deceleration: number;
  velocityFactor: number;
  clamp?: number[];
  velocity: number;
}

export interface DecayState extends AnimationState {
  lastTimestamp: number;
  startTimestamp: number;
  initialVelocity: number;
  velocity: number;
}
