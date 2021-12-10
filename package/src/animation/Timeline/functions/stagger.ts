import type { DistributeParams, TimelineInfo } from "../types";

import { distribute } from "./distribute";

/**
 *
 * @description Returns a new timeline array with children that have
 * offsets calculated with staggering
 * @param params Stagger parameters. @see DistributeParam<T>
 * @param items TimelineInfos to stagger
 * @returns A new array of timelines with updated offsets
 */
export function getStaggeredTimeline<T>(
  params: number | DistributeParams<T> | undefined,
  items: TimelineInfo<T>[]
): TimelineInfo<T>[] {
  if (params === undefined) {
    return items;
  }
  const resolvedParams = typeof params === "number" ? { each: params } : params;

  // Resolve easing
  const staggerFunc = distribute({
    ...resolvedParams,
    easing: resolvedParams.easing
      ? resolvedParams.easing
      : (input: number) => input,
  });
  return items.map((c, i) => ({
    ...c,
    delay: staggerFunc(i, c, items),
    repeatDelay: items.reduce(
      (p, c2) => Math.max(p, c2._offset + c2.duration),
      0
    ),
  }));
}
