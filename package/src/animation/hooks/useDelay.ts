import { useMemo } from "react";

import type { Animation } from "../types";
import { Timelines } from "../Timeline";

import { useAnimation } from "./useAnimation";

export const useDelay = (
  animation: Animation,
  params?: { delaySeconds?: number; startPaused?: boolean }
) => {
  const nextAnimation = useMemo(
    () => Timelines.delay(animation, params),
    [animation, params]
  );
  return useAnimation(nextAnimation, params?.startPaused);
};
