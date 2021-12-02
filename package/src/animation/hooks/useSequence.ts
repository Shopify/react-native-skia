import { useMemo } from "react";

import type { Animation } from "../types";
import { Timeline } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useSequence = (animations: Animation[], startPaused = false) => {
  const nextAnimation = useMemo(
    () => Timeline.sequence(animations),
    [animations]
  );
  return useAnimation(nextAnimation, startPaused);
};
