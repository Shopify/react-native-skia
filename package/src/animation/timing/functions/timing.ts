import type { AnimationState } from "../../../values/types";

/**
 * Calculates and returns a timing value based on the
 * input parameters. The timing value is a number between
 * 0 and 1.
 * @param t
 * @param duration
 * @param easing
 * @param loop
 * @param yoyo
 * @param onStop
 * @returns
 */
export const timing = (
  t: number,
  duration: number,
  easing: (t: number) => number,
  loop: boolean,
  yoyo: boolean,
  state: AnimationState
) => {
  let current = t / duration;
  let { finished } = state;
  // Side effect to stop animation when duration is reached (if loop is false)
  if (current >= 1.0 && !loop) {
    finished = true;
    current = 1.0;
  }
  // calculate return value
  let n = current % 1;
  if (yoyo) {
    n = current % 2.0 >= 1.0 ? 1 - (current % 1) : current % 1;
  } else if (!loop) {
    if (current >= 1.0) {
      n = 1.0;
    }
  }
  current = easing(Math.max(0, Math.min(1, n)));
  return {
    current,
    finished,
  };
};
