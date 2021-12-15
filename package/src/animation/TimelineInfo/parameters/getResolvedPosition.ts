import type { TimelineInfo } from "../types";

/**
 * @description Returns a resolved position of the list of previous timelines
 * @param timelines Previous timelines
 * @param position Position string.
 */
export function getResolvedPosition<T>(
  timeline: TimelineInfo<T>,
  position: string | number | undefined
): number | undefined {
  if (position === undefined) {
    return undefined;
  }
  if (typeof position === "number") {
    return position;
  }
  const timelines = timeline.children;
  if (position === "<") {
    // If no last item is found, return 0
    if (timelines.length === 0) {
      return 0;
    }
    // Return last item's start
    return timeline._duration;
  } else if (position === ">") {
    // If no last item is found, return 0
    if (timelines.length === 0) {
      return 0;
    }
    // Return last item's start + duration
    return (
      timelines[timelines.length - 1]._offset +
      timelines[timelines.length - 1]._duration
    );
  } else if (position.includes("=")) {
    // Try splitting on '=' sign
    const parts = position.split("=");
    if (parts.length > 2) {
      throw Error(
        "Position parameter with equal expression needs a left and right part."
      );
    }
    // Now lets evaluate expression
    const operator = parts[0].trim();
    const value = parts[1].trim();
    if (isNaN(parseInt(value, 10))) {
      throw Error("Expression should be a number");
    }
    if (operator === "+") {
      return (
        timelines[timelines.length - 1]._offset +
        timelines[timelines.length - 1]._duration +
        parseInt(value, 10)
      );
    } else if (operator === "-") {
      return Math.max(
        0,
        timelines[timelines.length - 1]._offset +
          timelines[timelines.length - 1]._duration -
          parseInt(value, 10)
      );
    }
  }
  return undefined;
}
