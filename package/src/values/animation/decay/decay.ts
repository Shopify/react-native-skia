import type { DecayState, DefaultDecayConfig } from "./types";

const VELOCITY_EPS = 1;
const SLOPE_FACTOR = 0.1;

export const decay = (
  now: number,
  state: DecayState,
  config: DefaultDecayConfig
): DecayState => {
  const { lastTimestamp, startTimestamp, initialVelocity, current, velocity } =
    state;
  const nextState = { ...state };
  const deltaTime = Math.min(now - lastTimestamp, 64);
  const v =
    velocity *
    Math.exp(
      -(1 - config.deceleration) * (now - startTimestamp) * SLOPE_FACTOR
    );
  nextState.current = current + (v * config.velocityFactor * deltaTime) / 1000; // /1000 because time is in ms not in s
  nextState.velocity = v;
  nextState.lastTimestamp = now;

  if (config.clamp) {
    if (initialVelocity < 0 && nextState.current <= config.clamp[0]) {
      nextState.current = config.clamp[0];
      nextState.finished = true;
    } else if (initialVelocity > 0 && nextState.current >= config.clamp[1]) {
      nextState.current = config.clamp[1];
      nextState.finished = true;
    }
  }
  nextState.finished = Math.abs(v) < VELOCITY_EPS;
  return nextState;
};
