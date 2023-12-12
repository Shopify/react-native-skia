import type {
  AnimationState,
  ISkiaValueApi,
  SkiaAnimation,
  SkiaClockValue,
  SkiaMutableValue,
  SkiaValue,
} from "./types";

declare global {
  var SkiaValueApi: ISkiaValueApi;
}

const { SkiaValueApi } = global;

const deprecatedWarning = () => {
  console.warn(
    `Skia values are deprecated and will be removed in the next Skia release.
Please use Reanimated instead: https://shopify.github.io/react-native-skia/docs/animations/animations`
  );
};

export const ValueApi = {
  /**
   * @deprecated Use Reanimated 3
   * for animating Skia: https://shopify.github.io/react-native-skia/docs/animations/animations
   */
  createValue<T>(initialValue: T): SkiaMutableValue<T> {
    deprecatedWarning();
    return SkiaValueApi.createValue(initialValue);
  },
  /**
   * @deprecated Use Reanimated 3
   * for animating Skia: https://shopify.github.io/react-native-skia/docs/animations/animations
   */
  createComputedValue<R>(
    cb: () => R,
    values: SkiaValue<unknown>[]
  ): SkiaValue<R> {
    deprecatedWarning();
    return SkiaValueApi.createComputedValue(cb, values);
  },
  /**
   * @deprecated Use Reanimated 3
   * for animating Skia: https://shopify.github.io/react-native-skia/docs/animations/animations
   */
  createClockValue(): SkiaClockValue {
    deprecatedWarning();
    return SkiaValueApi.createClockValue();
  },
  /**
   * @deprecated Use Reanimated 3
   * for animating Skia: https://shopify.github.io/react-native-skia/docs/animations/animations
   */
  createAnimation<S extends AnimationState = AnimationState>(
    cb: (t: number, state: S | undefined) => S
  ): SkiaAnimation {
    deprecatedWarning();
    return SkiaValueApi.createAnimation(cb);
  },
};
