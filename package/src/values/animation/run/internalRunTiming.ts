import type { IValue } from "../../types";
import { internalCreateTiming } from "../create/internalCreateTiming";
import type { RequiredAnimationParams } from "../functions/getResolvedParams";
import type { TimingConfig, IAnimation } from "../types";
/**
 * Creates a new animation on an existing value that will be driven by
 * an animation value. The value will be run from / to the value in
 * params and modified by the provided easing curve for the length of
 * the duration. When the value has reached its desired "to" value the
 * animation will be stopped.
 *
 * @param value The value to animate
 * @param toOrParams To value or Animation parameters
 * @param config Spring or timing configuration
 * @returns an animation value that can be used to start/stop
 * the animation.
 */
export const internalRunTiming = (
  value: IValue<number>,
  params: RequiredAnimationParams & Required<TimingConfig>
): IAnimation => {
  return internalCreateTiming(params, value);
};
