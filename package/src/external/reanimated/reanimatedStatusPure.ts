import type { getReanimatedStatus as original } from "./reanimatedStatus";

export const getReanimatedStatus: typeof original = () => {
  return { HAS_REANIMATED: false, HAS_REANIMATED_3: false };
};
