import type { TimelineInfo } from "../types";

export function visit<T>(
  timeline: TimelineInfo<T>,
  cb: (t: TimelineInfo<T>) => void
) {
  cb(timeline);
  timeline.children.forEach((t) => visit(t, cb));
}
