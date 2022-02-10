import type { TimelineInfo } from "../types";

import { normalizer } from "./normalize";

/**
 * Returns a value for the given timeline based on the input t
 * @param t Current time - between 0 and 1
 * @param tli Timeline to calculate value for
 * @param totalDuration Total duration of parent timeline
 * @returns A value between 0..1 for the given timeline
 */
export const normalizeForTimeline = <T>(
  t: number,
  tli: TimelineInfo<T>,
  totalDuration: number
): number | undefined => {
  const v = normalizer(t * totalDuration, {
    duration: tli.duration,
    total: totalDuration,
    offset: tli._offset,
    repeat: tli.repeat,
    repeatDelay: tli.repeatDelay,
    yoyo: tli.yoyo,
  });
  if (v < 0 || v > 1) {
    return undefined;
  }
  return v;
};
