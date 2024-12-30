import { interpolate, useCurrentFrame } from "remotion";

import { CLAMP } from "./Options";

export const useLoop = (
  durationInFrames = 15,
  boomerang = true,
  startsAtFrame = 0,
  wait = 0
) => {
  const frame = Math.max(useCurrentFrame() - startsAtFrame, 0);
  // Number of frames in the current iteration
  const inputRange = [0, durationInFrames - 1];
  const outputRange = [0, 1];
  if (wait > 0) {
    inputRange.push(durationInFrames - 1 + wait);
    outputRange.push(1);
  }
  const progress = interpolate(
    frame % durationInFrames,
    inputRange,
    outputRange,
    {
      ...CLAMP,
      //easing: Easing.bezier(0.65, 0, 0.35, 1),
    }
  );
  // If the current iteration is even
  // then we are going back from 1 to 0
  const currentIteration = Math.floor(frame / durationInFrames);
  const isGoingBack = currentIteration % 2 === 0;
  // if we are going back, we invert the progress
  return isGoingBack && boomerang ? 1 - progress : progress;
};
