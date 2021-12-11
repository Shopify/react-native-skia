import type { TimelineInfo } from "../types";

import { normalizer } from "./normalize";

export const normalizeForTimeline = <T>(
  value: number,
  tli: TimelineInfo<T>,
  totalDuration: number
): number => {
  const v = normalizer(value, {
    duration: tli.duration,
    total: totalDuration,
    offset: tli._offset,
    repeat: tli.repeat,
    repeatDelay: tli.repeatDelay,
    yoyo: tli.yoyo,
  });
  return Math.min(1.0, Math.max(0.0, v));
};
