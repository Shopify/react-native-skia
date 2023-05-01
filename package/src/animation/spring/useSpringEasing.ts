import { useMemo } from "react";
import { SkiaValue } from "../../values";
import { SpringConfig } from "../types";
import { createSpringEasing } from "./createSpringEasing";

export const useSpringEasing = (value: SkiaValue, config: SpringConfig) => {
  return useMemo(() => {
    const interpolator = createSpringEasing(config);
    interpolator.animation = value;
    return interpolator;
  }, [config, value]);
};
