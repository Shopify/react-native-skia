---
id: reanimated
title: Reanimated
sidebar_label: Reanimated
slug: /animations/reanimated
---

# Reanimated integration

This library works well with other animation providers, and it is possible to use it with `react-native-reanimated`.

For this to work the library provides a hook that connects a `SkiaView` or `Canvas` to a Reanimated Shared Value. When using this hook the SkiaView will redraw whenever the shared value changes.

## Definition

```tsx
useSharedValueEffect(ref: RefObject<SkiaView>, ...values: Reanimated.SharedValue<any>)
```

## Example

It is used by connecting a SkiaView or Canvas with a shared value. In the example below we are running a Reanimated animation on the shared value named progress - and then we connect our Canvas and shared value by using the `useSharedValueEffect` hook:

```tsx twoslash
import {useRef, useEffect} from "react";
import {Canvas, SkiaView, Rect, mix, useSharedValueEffect, useCanvasRef} from "@shopify/react-native-skia";
import {useSharedValue, withRepeat, withTiming} from "react-native-reanimated";

const MyComponent = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, [progress]);

  const ref = useCanvasRef();
  useSharedValueEffect(ref, progress);

  return (
    <Canvas style={{ flex: 1 }} ref={ref}>
      <Rect
        x={() => mix(progress.value, 0, 100)}
        y={100}
        width={10}
        height={10}
        color="red"
      />
    </Canvas>
  );
};
```
