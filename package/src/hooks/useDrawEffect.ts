/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect } from "react";
import type Animated from "react-native-reanimated";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import {
  startMapper,
  stopMapper,
  // @ts-ignore
} from "react-native-reanimated/lib/reanimated2/core";

import type { RNSkiaDrawCallback } from "../views";

/**
 * Sets one or more shared values in Reanimated as triggers for calling the
 * redraw function of the SkiaView.
 * @param callback onDraw callback created with useDrawCallback
 * @param triggers one or more shared values to set as triggers
 * */
export const useDrawEffect = (
  callback: RNSkiaDrawCallback,
  ...triggers: (Animated.SharedValue<unknown> | undefined)[]
) => {
  const v = useSharedValue(0);

  useEffect(() => {
    // @ts-ignore
    const nativeId = callback.__nativeId;
    if (!nativeId) {
      return;
    }

    const mapperId = startMapper(
      () => {
        "worklet";
        runOnJS(invalidateSkiaView)(parseInt(nativeId, 10));
      },
      triggers,
      [v]
    );

    return () => {
      stopMapper(mapperId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const invalidateSkiaView = (nativeId: number) => {
  global.invalidateSkiaView && global.invalidateSkiaView(nativeId);
};
