import type { TimelineInfo } from "../types";

/**
 *
 * @description Creates a new timeline information object
 * @param info Parameters of timeline info object
 * @returns The newly created timeline info object
 */
export function createTimeline<T>(
  info: Partial<Omit<TimelineInfo<T>, "children">> = {}
): TimelineInfo<T> {
  return {
    delay: undefined,
    repeatDelay: 0,
    duration: 0,
    children: [],
    repeat: 1,
    yoyo: false,
    data: undefined,
    _offset: 0,
    _duration: 0,
    ...info,
  };
}
