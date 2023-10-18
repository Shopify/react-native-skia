---
id: animations
title: Animations
sidebar_label: Animations
slug: /animations/animations
---

React Native Skia provides an integration with [Reanimated v3](https://docs.swmansion.com/react-native-reanimated/) that allows for animations
to be executed on the UI-thread. 

This integration is available with Reanimated v3 or higher. If you are using Reanimated 2, [see Reanimated 2 support](#reanimated-2).

## Hello World

React Native Skia accepts Reanimated shared and derived values directly as properties.
There is no need to use functions like `createAnimatedComponent` or `useAnimatedProps`, you can pass the reanimated values as properties directly. 

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

Reanimated and Skia use different color formats. You can interpolate colors using `interpolateColors` from Skia. If you use `interpolateColor` from Reanimated, you need to convert it using `convertToRGBA` from Reanimated.

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

## Reanimated 2

:::info

The Reanimated 2 integration runs on the JS thread. We suggest using Reanimated 3 if possible, [see Reanimated 3 support](/docs/animations/reanimated).

:::

We also provide a seamless integration with Reanimated v2 but it contains two caveats:
* [Animations are executed on the JS thread](#animations-on-the-js-thread)
* [Host Objects](#object-objects)

### Animations on the JS thread

In the example below we are running a simple animation but with Reanimated v2, it will run on the JS thread.

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

If you animations invokes Skia objects with Reanimated v2, we need to execute the code explicitly on the JS thread.
We provide a `useDerivedValueOnJS` hook to help with that process.

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

Similarly, if you want to use host objects within a gesture handler, you will need to execute it on the JS thread:

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