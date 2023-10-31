---
id: animations
title: Reanimated 3
sidebar_label: Reanimated 3
slug: /animations/animations
---

React Native Skia offers integration with [Reanimated v3](https://docs.swmansion.com/react-native-reanimated/), enabling animations to be executed on the UI-thread.

Note: This integration is available starting from Reanimated v3. If you are using Reanimated 2, refer to the [Reanimated 2 support section](#reanimated-2).

React Native Skia supports direct usage of Reanimated's shared and derived values as properties. There's no need for functions like `createAnimatedComponent` or `useAnimatedProps`; simply pass the reanimated values directly as properties.

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

When animating with React Native Skia, we recommend to avoid making new JSI allocations on each frame.
Instead of creating a new value on each frame to notify Reanimated that the value has changed, we mutate the value directly and simply notify reanimated that the value has changed.
Consider the following example:

```tsx twoslash
import {Gesture} from "react-native-gesture-handler";
import {useSharedValue} from "react-native-reanimated";
import {Skia, notifiyChange} from "@shopify/react-native-skia";

const matrix = useSharedValue(Skia.Matrix());
const path = useSharedValue(Skia.Path.Make().moveTo(0, 0));

const pan = Gesture.Pan().onChange((e) => {
  // ❌ Here we create a new path on every frame
  const newPath = path.value.copy();
  path.value = newPath.lineTo(e.changeX, e.changeY);
});

const pan2 = Gesture.Pan().onChange((e) => {
  // ✅ Instead we mutate the value and notify reanimated that it has changed
  path.value.lineTo(e.changeX, e.changeY);
  notifiyChange(path);
});

const pinch = Gesture.Pinch().onChange((e) => {
  // ❌ Here we create a new matrix on every frame
  const newMatrix = Skia.Matrix(matrix.value.get());
  matrix.value = newMatrix.scale(e.scale);
});

const pinch2 = Gesture.Pinch().onChange((e) => {
  // ✅ Here we mutate and then notify
  matrix.value.scale(e.scale);
  notifiyChange(matrix);

});
```

We hope that you will find this pattern sensible.
`path.interpolate` has now an extra parameter to interpolate paths without allocating new paths.
We provide a [usePathInterpolation](/docs/animations/hooks#usepathinterpolation) hook that will do all the heavy lifting for you.

## Canvas Size

The Canvas element has a `onSize` property that can receive a shared value that will be updated when the canvas size changes.

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
