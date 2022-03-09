---
id: reanimated
title: Reanimated
sidebar_label: Reanimated
slug: /animations/reanimated
---

# Reanimated

This library works well with other animation providers, and it is possible to use it with the main one, namely `react-native-reanimated`.
A common use-case for using the Reanimated 2 integration is when using `react-native-gesture-handler` and you need to use Reanimated animation values to drive the drawing.

## Example

In the example below, we use the `useValueEffect` hook to listen to a change of a clock value (this will be executed on every frame).
On every update, we read the value from reanimated and assign a new Skia value.

```tsx twoslash
import React, { useEffect } from "react";
import {
  Canvas,
  Rect,
  mix,
  useClockValue,
  useValueEffect,
  useValue,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const Demo = () => {
  const reanimatedValue = useSharedValue(0);

  const clock = useClockValue();
  const x = useValue(0);

  useEffect(() => {
    reanimatedValue.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, []);

  useValueEffect(clock, () => {
    x.current = mix(reanimatedValue.value, 0, 400);
  });
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={x} y={100} width={10} height={10} color="red" />
    </Canvas>
  );
};
```
