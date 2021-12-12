import type { TimelineInfo } from "../types";

import { duration } from "./duration";
import { offsets } from "./offsets";
import { visit } from "./visit";

/**
 * @description Returns a flattened array of all items in the timeline.
 * Offsets and duration will be calculated
 * @param timeline
 */
export function getTimelines<T>(
  timeline: TimelineInfo<T>
): Array<TimelineInfo<T>> {
  const withOffsets = offsets(timeline);
  const timelines: Array<TimelineInfo<T>> = [];
  visit(withOffsets, (t) => timelines.push({ ...t, _duration: duration(t) }));
  return timelines;
}
