import { useMemo } from "react";

import type { Animation } from "../types";
import { Timeline } from "../Timeline";
import type { StaggerParams } from "../Timeline/stagger";

import { useAnimation } from "./useAnimation";

export const useStagger = (
  animations: Animation[],
  params?: StaggerParams & { startPaused?: boolean }
) => {
  const nextAnimation = useMemo(
    () => Timeline.stagger(animations, params),
    [animations, params]
  );
  return useAnimation(nextAnimation, params?.startPaused);
};
