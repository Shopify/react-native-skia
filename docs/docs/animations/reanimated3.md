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
  const c = useDerivedValue(() => size - r.value, [r.value]);
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

We offer some [Skia specific animation hooks](/docs/animations/hooks), especially for paths.