import { useRef } from "react";

import type { EasingFunction } from "./Easing";
import { useFrame } from "./Animations";
import { Easing } from "./Easing";
import type { BaseAnimationState } from "./AnimationState";

interface TimingAnimationState extends BaseAnimationState {
  duration: number;
  easing: EasingFunction;
  startTime: number | null;
}

interface TimingConfig {
  from?: number;
  to?: number;
  duration?: number;
  easing?: EasingFunction;
}

export const useTiming = (
  config: TimingConfig,
  deps?: Parameters<typeof useFrame>[1]
) => {
  const state = useRef<TimingAnimationState>({
    from: config.from ?? 0,
    to: config.to ?? 1,
    duration: config.duration ?? 1000,
    easing: config.easing ?? Easing.inOut(Easing.ease),
    done: false,
    value: 0,
    startTime: null,
  });
  return useFrame(({ timestamp }) => {
    const now = timestamp * 1000;
    const { to, from, duration, done, easing } = state.current;
    if (done) {
      return state.current.value;
    }
    if (state.current.startTime === null) {
      state.current.startTime = now;
    }
    const runtime = now - state.current.startTime;
    if (runtime >= duration) {
      state.current.done = true;
    } else {
      const progress = easing(runtime / duration);
      state.current.value = from + (to - from) * progress;
    }
    return state.current.value;
  }, deps ?? []);
};

export const useLoop = (
  config: TimingConfig,
  boomerang = true,
  deps?: Parameters<typeof useFrame>[1]
) =>
  useFrame((ctx) => {
    const timestamp = ctx.timestamp * 1000;
    const duration = config.duration ?? 1000;
    const progress = normalize(timestamp, duration);
    const currentIteration = Math.floor(timestamp / duration);
    const isGoingBack = currentIteration % 2 === 0;
    return isGoingBack && boomerang ? 1 - progress : progress;
  }, deps ?? []);

const normalize = (timestamp: number, duration: number) =>
  (timestamp / duration / 1) % 1;
