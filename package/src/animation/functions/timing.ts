import type { AnimationState } from "./types";

export const timing = (timestamp: number, state: AnimationState) => {
  const now = timestamp * 1000;
  const { to, from, duration, done, easing } = state;
  if (done) {
    return state.value;
  }
  if (state.startTime === null) {
    state.startTime = now;
  }
  const runtime = now - state.startTime;
  if (runtime > duration) {
    state.done = true;
    state.value = to;
  } else {
    const progress = easing(runtime / duration);
    state.value = from + (to - from) * progress;
  }
  return state.value;
};
