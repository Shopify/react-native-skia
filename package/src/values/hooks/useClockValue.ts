import { useAnimationValue } from "./useAnimationValue";

/**
 * @returns A new value that will be updated on every frame redraw with the
 * number of milliseconds elapsed since the value was started.
 * The clock is created in the stopped state.
 */

export const useClockValue = () => {
  return useAnimationValue((t) => t);
};
