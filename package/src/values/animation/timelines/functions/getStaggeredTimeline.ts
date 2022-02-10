import type { TimelineInfo, DistributeParams } from "../types";

import { distribute } from "./distribute";
import { sequential } from "./sequential";

/**
 *
 * @description Returns a new timeline array with children that have
 * offsets calculated with staggering
 * @param items TimelineInfos to stagger
 * @param params Stagger parameters. @see StaggerParams
 * @param base Starting point of the staggered timeline
 * @returns A new array of timelines with updated offsets
 */
export function getStaggeredTimeline<T>(
  items: TimelineInfo<T>[],
  params: number | DistributeParams | undefined,
  base?: number
): TimelineInfo<T>[] {
  if (params === undefined) {
    // Without params with should just return items
    return sequential(items, base);
  }
  if (items.length === 1) {
    // No need to stagger only one child
    return items;
  }
  if (items.length === 0) {
    throw Error("Can't create staggered timelines of empty timelines");
  }

  const resolvedParams = typeof params === "number" ? { each: params } : params;

  // Resolve easing - it is an expression and we need to create a simple evaluator
  // to be able to do a numeric evaluation when building the stagger
  const staggerFunc = distribute({
    ...resolvedParams,
    ...(base ? { base } : {}),
    easing: resolvedParams.easing
      ? resolvedParams.easing
      : (input: number) => input,
  });

  const staggeredItems = items.map((c, i) => ({
    ...c,
    delay: staggerFunc(i, c, items),
    repeatDelay: items.reduce(
      (p, c2) => Math.max(p, c2._offset + c2.duration),
      0
    ),
  }));
  return staggeredItems;
}
