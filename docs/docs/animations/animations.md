---
id: animations
title: Animations
sidebar_label: Animations
slug: /animations/animations
---

React Native Skia offers integration with [Reanimated v3](https://docs.swmansion.com/react-native-reanimated/), enabling animations to be executed on the UI-thread.

Note: This integration is available starting from Reanimated v3. If you are using Reanimated 2, refer to the [Reanimated 2 support section](#reanimated-2).

## Hello World

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

:::info

It's important to note that Reanimated and Skia employ different color formats. For color interpolation in Skia, use `interpolateColors`. If you're using interpolateColor from Reanimated, ensure you convert it with `convertToRGBA` from Reanimated.

```tsx twoslash
import {
  interpolateColor,
  useDerivedValue,
  // In react-native-reanimated <= 3.1.0, convertToRGBA is not exported yet in the types
  // @ts-ignore
  convertToRGBA,
} from "react-native-reanimated";

  const color = useDerivedValue(() =>
    convertToRGBA(
      interpolateColor(
        0,
        [0, 1],
        ["cyan", "magenta"]
      )
    )
  );
```

:::

### Canvas Size

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

## Reanimated 2

:::info

The Reanimated 2 integration operates on the JS thread. We recommend using Reanimated 3 when possible. For details, refer to the [Reanimated 3 support section](#hello-world).

:::

While we do provide a seamless integration with Reanimated v2, it comes with two caveats:
* [Animations are executed on the JS thread](#animations-on-the-js-thread)
* [Host Objects](#object-objects)

### Animations on the JS thread

In the example below, even though the animation is simple, it runs on the JS thread due to its use of Reanimated v2.

```tsx twoslash
import {useEffect} from "react";
import {Canvas, Rect, mix, useValue} from "@shopify/react-native-skia";
import {useSharedValue, withRepeat, withTiming, useDerivedValue} from "react-native-reanimated";

const MyComponent = () => {
  const x = useValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, [progress]);

  useDerivedValue(() => {
    return mix(progress.value, 0, 100);
  });

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

### Host Objects

When your animation invokes Skia objects with Reanimated v2, the code must explicitly run on the JS thread. To assist with this, we offer a `useDerivedValueOnJS` hook.

```tsx twoslash
import {useDerivedValueOnJS, Skia} from "@shopify/react-native-skia";
import {useDerivedValue} from "react-native-reanimated";

const path = Skia.Path.MakeFromSVGString("M 344 172 Q 344 167 343.793 163")!;
const path2 = Skia.Path.MakeFromSVGString("M 347 169 Q 344 167 349 164")!;

// ❌ this will crash as it's running on the worklet thread
useDerivedValue(() => path.interpolate(path2, 0.5));

// ✅ this will work as expected
useDerivedValueOnJS(() => path.interpolate(path2, 0.5));
```

Similarly, if you intend to use host objects inside a gesture handler, ensure its execution on the JS thread:

```tsx twoslash
import {vec} from "@shopify/react-native-skia";
import {Gesture} from "react-native-gesture-handler";
import {useSharedValue} from "react-native-reanimated";

const pos = useSharedValue(vec(0, 0));

// ❌ this will crash as it's running on the worklet thread
Gesture.Pan().onChange(e => pos.value = vec(e.x, 0));

// ✅ this will work as expected
Gesture.Pan().runOnJS(true).onChange(e => pos.value = vec(e.x, 0));
```