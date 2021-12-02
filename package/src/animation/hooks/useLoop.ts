import { useMemo } from "react";

import type { Animation } from "../types";
import { Timeline } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useLoop = (
  animation: Animation,
  yoyo = false,
  startPaused = false
) => {
  const nextAnimation = useMemo(
    () => Timeline.loop(animation, yoyo),
    [animation, yoyo]
  );
  return useAnimation(nextAnimation, startPaused);
};
