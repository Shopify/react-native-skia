import React from "react";
import type { SkiaView } from "@shopify/react-native-skia";
import {
  useSharedValueEffect,
  Canvas,
  Circle,
  Group,
} from "@shopify/react-native-skia";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { PinchGestureHandler } from "react-native-gesture-handler";

import { GestureDemo, Padding } from "./Components";

const { width } = Dimensions.get("window");
type PinchContext = {
  offsetFromFocalX: number;
  offsetFromFocalY: number;
  prevTranslateOriginX: number;
  prevTranslateOriginY: number;
  prevPointers: number;
  translateOriginX: number;
  translateOriginY: number;
  start: boolean;
};

export const PinchGesture = () => {
  const scale = useSharedValue(1);
  const origin = { x: useSharedValue(0), y: useSharedValue(0) };
  const translation = { x: useSharedValue(0), y: useSharedValue(0) };

  const pinchHandler = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    PinchContext
  >({
    onStart(e, ctx) {
      // On android, we get focalX and focalY 0 in onStart callback. So, use a flag and set
      // initial focalX and focalY in onActive
      // 😢 https://github.com/software-mansion/react-native-gesture-handler/issues/546
      ctx.start = true;
    },

    onActive(e, ctx) {
      if (ctx.start) {
        origin.x.value = e.focalX;
        origin.y.value = e.focalY;

        ctx.offsetFromFocalX = origin.x.value;
        ctx.offsetFromFocalY = origin.y.value;
        ctx.prevTranslateOriginX = origin.x.value;
        ctx.prevTranslateOriginY = origin.y.value;
        ctx.prevPointers = e.numberOfPointers;

        ctx.start = false;
      }

      scale.value = e.scale;

      if (ctx.prevPointers !== e.numberOfPointers) {
        ctx.offsetFromFocalX = e.focalX;
        ctx.offsetFromFocalY = e.focalY;
        ctx.prevTranslateOriginX = ctx.translateOriginX;
        ctx.prevTranslateOriginY = ctx.translateOriginY;
      }

      ctx.translateOriginX =
        ctx.prevTranslateOriginX + e.focalX - ctx.offsetFromFocalX;
      ctx.translateOriginY =
        ctx.prevTranslateOriginY + e.focalY - ctx.offsetFromFocalY;

      translation.x.value = ctx.translateOriginX - origin.x.value;
      translation.y.value = ctx.translateOriginY - origin.y.value;

      ctx.prevPointers = e.numberOfPointers;
    },
    onEnd() {
      scale.value = withSpring(1, {
        stiffness: 60,
        overshootClamping: true,
      });
      translation.x.value = withSpring(0, {
        stiffness: 60,
        overshootClamping: true,
      });
      translation.y.value = withSpring(0, {
        stiffness: 60,
        overshootClamping: true,
      });
    },
  });

  const canvasRef = React.useRef<SkiaView>(null);
  useSharedValueEffect(canvasRef, scale);

  return (
    <GestureDemo title="Pinch Gesture">
      <Canvas style={styles.canvas} innerRef={canvasRef}>
        <Group
          transform={() => [
            { translateX: translation.x.value },
            {
              translateY: translation.y.value,
            },

            { translateX: origin.x.value },
            { translateY: origin.y.value },
            {
              scale: scale.value,
            },
            {
              translateX: -origin.x.value,
            },
            {
              translateY: -origin.y.value,
            },
          ]}
        >
          <Circle cx={width / 2} cy={100} r={50} />
        </Group>
      </Canvas>
      <View style={styles.pinchViewContainer}>
        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View style={styles.pinchView} />
        </PinchGestureHandler>
      </View>
    </GestureDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 200,
    width: width - Padding,
    backgroundColor: "#FEFEFE",
  },
  pinchView: {
    height: 200,
    width: width - Padding,
  },
  pinchViewContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
  },
});
