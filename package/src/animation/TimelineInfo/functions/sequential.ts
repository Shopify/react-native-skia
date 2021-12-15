import type { TimelineInfo } from "../types";

export const sequential = <T>(timelineInfos: TimelineInfo<T>[], base = 0) => {
  const retVal: TimelineInfo<T>[] = [];
  timelineInfos.forEach((tl, index) => {
    if (index > 0) {
      retVal.push({
        ...tl,
        delay: base + timelineInfos[index - 1]._duration,
      });
    } else {
      retVal.push({ ...tl, delay: base });
    }
  });
  return retVal;
};
