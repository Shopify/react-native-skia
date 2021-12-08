import { useMemo } from "react";

import type { Animation } from "../types";
import { Timelines } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useLoop = (
  animation: Animation,
  params?: { yoyo?: boolean; repeatCount?: number; startPaused?: boolean }
) => {
  const nextAnimation = useMemo(
    () => Timelines.loop(animation, params),
    [animation, params]
  );
  return useAnimation(nextAnimation, params?.startPaused);
};
