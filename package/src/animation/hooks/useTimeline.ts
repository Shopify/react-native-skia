import { useMemo } from "react";

import type { Animation, TimelineAnimation } from "../types";
import { Timeline } from "../Timeline";
import type { DistributeParams } from "../Timeline/types";

import { useAnimation } from "./useAnimation";

export const useTimeline = (
  animations: Animation[],
  params?: DistributeParams<Animation>
): TimelineAnimation => {
  const nextAnimation = useMemo(() => {
    const tl = Timeline.create(animations, params);
    return tl;
  }, [animations, params]);
  return useAnimation(nextAnimation);
};
