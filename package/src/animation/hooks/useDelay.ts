import { useMemo } from "react";

import type { Animation } from "../types";
import { Timeline } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useDelay = (
  animation: Animation,
  params?: { delaySeconds?: number; startPaused?: boolean }
) => {
  const nextAnimation = useMemo(
    () => Timeline.delay(animation, params),
    [animation, params]
  );
  return useAnimation(nextAnimation, params?.startPaused);
};
