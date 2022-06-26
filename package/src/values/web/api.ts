import type {
  ISkiaValueApi,
  SkiaMutableValue,
  SkiaValue,
  SkiaClockValue,
  AnimationState,
  SkiaAnimation,
} from "../types";

import { RNSkAnimation } from "./RNSkAnimation";
import { RNSkClockValue } from "./RNSkClockValue";
import { RNSkComputedValue } from "./RNSkComputedValue";
import { RNSkValue } from "./RNSkValue";

export const ValueApi: ISkiaValueApi = {
  createValue: function <T>(initialValue: T): SkiaMutableValue<T> {
    return new RNSkValue(initialValue);
  },
  createComputedValue: function <R>(
    cb: () => R,
    values: SkiaValue<unknown>[]
  ): SkiaValue<R> {
    return new RNSkComputedValue(cb, values);
  },
  createClockValue: function (): SkiaClockValue {
    return new RNSkClockValue(requestAnimationFrame.bind(window));
  },
  createAnimation: function <S extends AnimationState = AnimationState>(
    cb: (t: number, state: S | undefined) => S
  ): SkiaAnimation {
    return new RNSkAnimation(cb, requestAnimationFrame.bind(window));
  },
};
