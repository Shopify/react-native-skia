---
id: reanimated
title: Reanimated
sidebar_label: Reanimated
slug: /animations/reanimated
---

React Native Skia provides an integration with Reanimated that allows for animations
to be executed on the UI-thread. 

This integration is available with [Reanimated v3 or higher](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation). If you are using Reanimated 2, [see Reanimated 2 support](#reanimated-2).

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

## Reanimated 2

If you are using Reanimated 2, we offer a hook named `useSharedValueEffect` where you can update Skia values when Reanimated values are updated.

:::info

useSharedValueEffect() runs on the JS thread. We suggest using Reanimated 3 if possible, [see Reanimated 3 support](/docs/animations/reanimated).

:::


### Example

In the example below we are running a Reanimated animation on the shared value named progress - and then we have callback invoked on any shared value change thanks to the useSharedValueEffect hook:

```tsx twoslash
import {useEffect} from "react";
import {Canvas, Rect, mix, useSharedValueEffect, useValue} from "@shopify/react-native-skia";
import {useSharedValue, withRepeat, withTiming} from "react-native-reanimated";

const MyComponent = () => {
  const x = useValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, [progress]);

  useSharedValueEffect(() => {
    x.current = mix(progress.value, 0, 100);
  }, progress); // you can pass other shared values as extra parameters

  return (
    <Canvas style={{ flex: 1 }}>
      <Rect
        x={x}
        y={100}
        width={10}
        height={10}
        color="red"
      />
    </Canvas>
  );
};
```