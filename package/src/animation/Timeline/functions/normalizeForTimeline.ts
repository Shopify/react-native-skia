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
  if (v < -0.1 || v > 1.0) {
    if (tli.active === true) {
      tli.active = false;
      if ((tli.position ?? 0) < 0.5) {
        tli.position = 0;
      } else {
        tli.position = 1;
      }
    }
    return tli.position ?? 0;
  }
  if (tli.active !== true) {
    tli.active = true;
  }
  tli.position = v;
  return Math.min(1.0, Math.max(0.0, v));
};
