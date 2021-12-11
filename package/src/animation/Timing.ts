import { Easing } from "./Easing";
import { createTiming, runTiming } from "./Animation";

export const Timing = {
  Easing,
  create: createTiming,
  run: runTiming,
};
