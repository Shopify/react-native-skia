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
  onStop: () => void
) => {
  let p = t / duration;
  // Side effect to stop animation when duration is reached (if loop is false)
  if (p >= 1.0 && !loop) {
    onStop();
    p = 1.0;
  }
  // calculate return value
  let n = p % 1;
  if (yoyo) {
    n = p % 2.0 >= 1.0 ? 1 - (p % 1) : p % 1;
  } else if (!loop) {
    if (p >= 1.0) {
      n = 1.0;
    }
  }
  return easing(Math.max(0, Math.min(1, n)));
};
