import { Easing } from "./Easing";
import type { AnimationParams, TimingConfig, SpringConfig } from "./types";

const DefaultParameters = {
  to: 1,
  from: 0,
  loop: false,
  yoyo: false,
  immediate: true,
};

const DefaultTimingConfig = {
  duration: 1000,
  easing: (t: number) => t,
};

/**
 * Resolves parameters from optional values to a single object
 * @param toOrParams Params or to value
 * @param config timing/spring configuration
 */
export const getResolvedParams = (
  toOrParams: number | AnimationParams,
  config?: TimingConfig | SpringConfig
): Required<AnimationParams> & Required<TimingConfig> => {
  let resolvedParameters: Required<AnimationParams> = {
    ...DefaultParameters,
  };

  if (typeof toOrParams === "number") {
    resolvedParameters.to = toOrParams;
  } else {
    resolvedParameters = {
      from: toOrParams.from ?? resolvedParameters.from,
      to: toOrParams.to ?? resolvedParameters.to,
      loop: toOrParams.loop ?? resolvedParameters.loop,
      yoyo: toOrParams.yoyo ?? resolvedParameters.yoyo,
      immediate: toOrParams.immediate ?? resolvedParameters.immediate,
    };
  }

  const resolvedConfig: Required<TimingConfig> = { ...DefaultTimingConfig };
  if (config) {
    if ("update" in config) {
      // Spring
      resolvedConfig.duration = config.duration;
      resolvedConfig.easing = config.update;
    } else {
      resolvedConfig.duration = config.duration;
      resolvedConfig.easing = config.easing ?? Easing.linear;
    }
  }

  return { ...resolvedParameters, ...resolvedConfig };
};
