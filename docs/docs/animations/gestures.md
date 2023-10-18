---
id: gestures
title: Gestures
sidebar_label: Gestures
slug: /animations/gestures
---


In combination with [reanimated](/docs/animations/animations), we recommend to use [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/).

We have built a couple of [tutorial](docs/tutorials#gestures) that showcase the use of advanced gestures in the context of Skia drawings.

```tsx twoslash
import { useWindowDimensions } from "react-native";
import { Canvas, Circle, Fill } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

import { useSharedValue, withDecay } from "react-native-reanimated";


export const AnimationWithTouchHandler = () => {
  const { width } = useWindowDimensions();
  const leftBoundary = 0;
  const rightBoundary = width;
  const translateX = useSharedValue(width / 2);

  const gesture = Gesture.Pan()
    .onChange((e) => {
      translateX.value += e.changeX;
    })
    .onEnd((e) => {
      translateX.value = withDecay({
        velocity: e.velocityX,
        clamp: [leftBoundary, rightBoundary],
      });
    });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="white" />
        <Circle cx={translateX} cy={40} r={20} color="#3E3E" />
      </Canvas>
    </GestureDetector>
  );
};
```

## Element Tracking

A common use-case is to have gestures only activate the gesture for a particular element on the Canvas.
Gesture Handler is really good at that because it can take into account all the transformations applied to an element (translations, scaling, rotations).
For each element you would like to track, simply overlay an animated view onto which you apply the exact same transformations than the one you apply to your canvas element.

In the example below, each circle is track separately by two gesture handlers.

```tsx
import { View } from "react-native";
import { Canvas, Circle, Fill } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

const radius = 30;

export const ElementTracking = () => {
  // The position of the ball
  const x = useSharedValue(100);
  const y = useSharedValue(100);
  // This is the style we will apply to the "invisible" animated view
  // that will overlay the ball
  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: -radius,
    left: -radius,
    width: radius * 2,
    height: radius * 2,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));
  // The gesture handler for the ball
  const gesture = Gesture.Pan().onChange((e) => {
    x.value += e.x;
    y.value += e.y;
  });
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="white" />
        <Circle cx={x} cy={y} r={radius} color="cyan" />
      </Canvas>
      <GestureDetector gesture={gesture}>
        <Animated.View style={style} />
      </GestureDetector>
    </View>
  );
};
```