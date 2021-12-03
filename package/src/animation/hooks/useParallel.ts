import { useMemo } from "react";

import type { Animation } from "../types";
import { Timeline } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useParallel = (
  animations: Animation[],
  params?: { startPaused?: boolean }
) => {
  const nextAnimation = useMemo(
    () => Timeline.parallel(animations),
    [animations]
  );
  return useAnimation(nextAnimation, params?.startPaused);
};
