import type { TimelineInfo } from "../types";

export function addTimeline<T>(
  timeline: TimelineInfo<T>,
  ...children: TimelineInfo<T>[]
): TimelineInfo<T> {
  return { ...timeline, children: [...timeline.children, ...children] };
}
