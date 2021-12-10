import { useMemo } from "react";

import type { AnimationValue } from "../types";
import { Spring } from "../Spring";
import type { SpringParams } from "../Spring";

import { useAnimation } from "./useAnimation";

export const useSpring = (
  animationValue: AnimationValue,
  params: SpringParams
) => {
  const animation = useMemo(() => Spring.create(params), [params]);

  return useAnimation(animation, animationValue);
};
