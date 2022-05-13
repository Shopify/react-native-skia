import type {
  RequiredAnimationParams,
  AnimationParams,
  TimingConfig,
} from "../../types";

const DefaultParameters = {
  to: 1,
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
  config?: TimingConfig
): RequiredAnimationParams & Required<TimingConfig> => {
  let resolvedParameters: RequiredAnimationParams = {
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
    };
  }

  const resolvedConfig: Required<TimingConfig> = { ...DefaultTimingConfig };
  if (config) {
    resolvedConfig.duration = config.duration ?? DefaultTimingConfig.duration;
    resolvedConfig.easing = config.easing ?? DefaultTimingConfig.easing;
  }

  return { ...resolvedParameters, ...resolvedConfig };
};
