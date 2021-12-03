import { useMemo } from "react";

import type { Animation } from "../types";
import { Timeline } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useLoop = (
  animation: Animation,
  params?: { yoyo?: boolean; repeatCount?: number; startPaused?: boolean }
) => {
  const nextAnimation = useMemo(
    () => Timeline.loop(animation, params),
    [animation, params]
  );
  return useAnimation(nextAnimation, params?.startPaused);
};
