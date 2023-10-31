---
id: animations
title: Reanimated 3
sidebar_label: Reanimated 3
slug: /animations/animations
---

React Native Skia offers integration with [Reanimated v3](https://docs.swmansion.com/react-native-reanimated/), enabling the execution of animations on the UI thread.

Note: This integration is available starting from Reanimated v3. If you are using Reanimated v2, refer to the [Reanimated 2 support section](#reanimated-2).

React Native Skia supports the direct usage of Reanimated's shared and derived values as properties. There is no need for functions like `createAnimatedComponent` or `useAnimatedProps`; simply pass the Reanimated values directly as properties.

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

## Performance

When animating with React Native Skia, we recommend avoiding new JSI allocations on each frame. Instead of creating a new value on each frame to notify Reanimated that the value has changed, directly mutate the value and notify Reanimated. Below are examples illustrating this pattern:

```tsx twoslash
import {Gesture} from "react-native-gesture-handler";
import {useSharedValue} from "react-native-reanimated";
import {Skia, notifyChange} from "@shopify/react-native-skia";

const matrix = useSharedValue(Skia.Matrix());
const path = useSharedValue(Skia.Path.Make().moveTo(0, 0));

const pan = Gesture.Pan().onChange((e) => {
  // ❌ Avoid creating a new path on every frame
  const newPath = path.value.copy();
  path.value = newPath.lineTo(e.changeX, e.changeY);
});

const pan2 = Gesture.Pan().onChange((e) => {
  // ✅ Instead, mutate the value directly and notify Reanimated
  path.value.lineTo(e.changeX, e.changeY);
  notifyChange(path);
});

const pinch = Gesture.Pinch().onChange((e) => {
  // ❌ Avoid creating a new matrix on every frame
  const newMatrix = Skia.Matrix(matrix.value.get());
  matrix.value = newMatrix.scale(e.scale);
});

const pinch2 = Gesture.Pinch().onChange((e) => {
  // ✅ Mutate the value and notify Reanimated
  matrix.value.scale(e.scale);
  notifyChange(matrix);
});
```

`path.interpolate` now has an extra parameter to interpolate paths without allocating new paths. We provide a [usePathInterpolation](/docs/animations/hooks#usepathinterpolation) hook that will do all the heavy lifting for you.

## Canvas Size

The Canvas element has an `onSize` property that can receive a shared value, which will be updated whenever the canvas size changes.

```tsx twoslash
import {useSharedValue} from "react-native-reanimated";
import {Fill, Canvas} from "@shopify/react-native-skia";

const Demo = () => {
  // size will be updated as the canvas size changes
  const size = useSharedValue({ width: 0, height: 0 });
  return (
    <Canvas style={{ flex: 1 }} onSize={size}>
      <Fill color="white" />
    </Canvas>
  );
};
```