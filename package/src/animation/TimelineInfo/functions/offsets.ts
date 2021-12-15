import type { TimelineInfo } from "../types";

/**
 * @description Returns a new timeline with correctly set offsets. Offsets uses
 * the delay parameter and the previous offset and returns a new timeline with
 * the correct offset values set for each timeline and children
 * @param tl Timeline to calulate offsets for
 * @param parentOffset Initial offset (from parent timeline)
 */
export const offsets = <T>(
  tl: TimelineInfo<T>,
  parentOffset = 0
): TimelineInfo<T> => {
  const selfOffset = parentOffset + (tl.delay || 0);
  const withDelayFromDuration: TimelineInfo<T>[] = [...tl.children];
  for (let i = 0; i < withDelayFromDuration.length; i++) {
    if (withDelayFromDuration[i].delay === undefined) {
      withDelayFromDuration[i].delay =
        i > 0
          ? withDelayFromDuration[i - 1].delay! +
            withDelayFromDuration[i - 1].duration
          : 0;
    }
  }
  const withOffsetsFromDelay = withDelayFromDuration.map((c) =>
    offsets(c, selfOffset)
  );
  return {
    ...tl,
    _offset: selfOffset,
    children: withOffsetsFromDelay,
  };
};
