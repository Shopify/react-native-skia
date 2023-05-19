import { ValueApi } from "../../values/api";
import type { SkiaMutableValue } from "../../values/types";

import type { DecayConfig, DefaultDecayConfig } from "./types";

/**
 * Runs a decay animation from the current value to zero with the given decay
 * configuration.
 * @param value value to animate
 * @param config Configuration or default configuration
 * @returns Animation
 */
export const runDecay = (
  value: SkiaMutableValue<number>,
  config?: DecayConfig
) => {
  const resolvedConfig: DefaultDecayConfig = {
    deceleration: 0.998,
    velocityFactor: 1,
    velocity: 0,
    from: value.current,
    clamp: [],
    ...config,
  };
  const decay = ValueApi.createDecay(resolvedConfig);
  value.animation = decay;
  decay.start();
  return decay;

  // TODO: Move to web implementation
  // const updateFunction = (t: number, state: DecayState | undefined) => {
  //   if (!state) {
  //     return {
  //       current: resolvedConfig.from,
  //       finished: false,
  //       lastTimestamp: t,
  //       startTimestamp: t,
  //       initialVelocity: resolvedConfig.velocity,
  //       velocity: resolvedConfig.velocity,
  //     };
  //   }
  //   return decay(t, state, resolvedConfig);
  // };
  // value.animation = ValueApi.createAnimation(updateFunction);
  // return value.animation;
};
