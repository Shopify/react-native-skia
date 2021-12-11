import type { TimelineInfo } from "../types";

import { duration } from "./duration";
import { offsets } from "./offsets";
import { visit } from "./visit";

/**
 * @description Returns timeline with calculated offsets and durations
 * @param timeline
 */
export function getTimeline<T>(timeline: TimelineInfo<T>): TimelineInfo<T> {
  const withOffsets = offsets(timeline);
  visit(withOffsets, (t) => (t._duration = duration(t)));
  return withOffsets;
}
