import type { TimelineInfo } from "../types";

/**
 * @description Returns the duration of the timline without children
 * @param tl TimelineInfo
 */
export const duration = <T>(tl: TimelineInfo<T>) => {
  const selfDuration = durationFromParams(tl);
  const childDuration: number = tl.children.reduce(
    (p, c) => (duration(c) + c._offset > p ? duration(c) + c._offset : p),
    0
  );
  return Math.max(selfDuration, childDuration);
};

function durationFromParams<T>(tl: TimelineInfo<T>) {
  return tl.duration * tl.repeat + Math.max(0, tl.repeat - 1) * tl.repeatDelay;
}
