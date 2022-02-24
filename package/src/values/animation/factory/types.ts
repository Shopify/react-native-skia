import type { AnimationParams } from "../types";

export type RequiredAnimationParams = Required<Omit<AnimationParams, "from">> &
  Pick<AnimationParams, "from">;
