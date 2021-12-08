import { useMemo } from "react";

import type { Animation } from "../types";
import { Timelines } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useSequence = (
  animations: Animation[],
  params?: { startPaused?: boolean }
) => {
  const nextAnimation = useMemo(
    () => Timelines.sequence(animations),
    [animations]
  );
  return useAnimation(nextAnimation, params?.startPaused);
};
