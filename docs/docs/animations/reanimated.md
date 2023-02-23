---
id: reanimated
title: Reanimated
sidebar_label: Reanimated
slug: /animations/reanimated
---

React Native Skia renders drawings on the UI-thread and it provides an integration with Reanimated that allows for animations
to be executed on the UI-thread as well.

First, you need will need to install [Reanimated v3](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation).

## Hello World

React Native Skia accepts Reanimated shared and derived values directly as properties.
It is as simple as that.

```tsx twoslash
import {useEffect} from "react";
import {Canvas, Circle, Group} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const HelloWorld = () => {
  const size = 256;
  const r = useSharedValue(0);
  const c = useDerivedValue(() => size - r.value);
  useEffect(() => {
    r.value = withRepeat(withTiming(size * 0.33, { duration: 1000 }), -1);
  }, [r, size]);
  return (
    <Canvas style={{ flex: 1 }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={c} cy={r} r={r} color="magenta" />
        <Circle
          cx={size/2}
          cy={c}
          r={r}
          color="yellow"
        />
      </Group>
    </Canvas>
  );
};
```

## Gesture Handler

This allows you to integrate with any library that supports Reanimated.
[React native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/) for instance.

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
        <Circle cx={translateX} cy={40} r={15} color="#AEAE" />
      </Canvas>
    </GestureDetector>
  );
};
```