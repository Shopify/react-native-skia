/* eslint-disable no-nested-ternary */
/**
 * @description Returns a normalize function that calculates normalized value
 * @param total Total duration of parent timeline
 * @param offset Offset for timeline (for first repeat)
 * @param duration Duration for timeline (for 1 repeat)
 * @param repeat Number of repeats for timeline (1 = no repeat, 2 = run once, repeat once)
 * @param repeatDelay Repeat delay - used to delay staggered repeats
 * @param yoyo True if every second repeat should run in reverse
 * @returns Returns a function that can be used to interpolate from time 0..1 and
 * the timeline with the offset, duration, repeat, repeatDelay and yoyo parameters.
 */
export const normalizer = (
  time: number,
  params: {
    total: number;
    duration: number;
    offset?: number;
    repeat?: number;
    repeatDelay?: number;
    yoyo?: boolean;
  }
) => {
  const {
    total,
    duration,
    offset = 0,
    repeat = 1,
    repeatDelay = 0,
    yoyo = false,
  } = params;

  // Verify offset
  if (offset + duration < 0 || offset + duration > total) {
    throw Error(
      "Offset + duration should be between zero and parent duration" +
        ` (${total}) - got offset: ${offset} and  duration: ${duration}`
    );
  }

  const calculdatedDuration =
    duration * repeat + Math.max(0, repeat - 1) * repeatDelay;

  // Verify Duration
  if (offset + calculdatedDuration > total) {
    throw Error(
      `Duration should be between 0 and ${total} - got ${
        offset + calculdatedDuration
      }`
    );
  }

  // Total
  const tltotal = offset + calculdatedDuration;

  // calc progress without offset
  const p = (-offset + time) * (1 / duration);

  // Calc end
  if (p < 0) {
    // We just return values below zero, knowing that these will
    // not be used for animation
    return p === Infinity ? 0 : p;
  }
  //  else if (time === tltotal) {
  //   // last repeat, return 1 (not zero, which is what each repeat would return)
  //   return 1;
  // }
  else if (time > tltotal) {
    // more than last repeat, we'll just return a number above 1
    return p === Infinity ? 1 : p;
  } else {
    // in repeat or regular - with/without yoyo
    const y =
      time === 0
        ? 1
        : Math.ceil((-offset + time) * (1 / (duration + repeatDelay))) % 2;
    const r =
      p === 0
        ? 0
        : p % 1 === 0
        ? 1
        : p % ((duration + repeatDelay) * (1 / duration));
    return yoyo && p > 0 && y === 0 ? 1 - r : r;
  }
};
