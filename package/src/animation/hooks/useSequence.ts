import { useMemo } from "react";

import type { Animation } from "../types";
import { Timeline } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useSequence = (
  animations: Animation[],
  params?: { startPaused?: boolean }
) => {
  const nextAnimation = useMemo(
    () => Timeline.sequence(animations),
    [animations]
  );
  return useAnimation(nextAnimation, params?.startPaused);
};
