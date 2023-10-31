---
id: reanimated2
title: Reanimated 2
sidebar_label: Reanimated 2
slug: /animations/reanimated2
---

:::info

The Reanimated 2 integration operates on the JS thread. We recommend using Reanimated 3 when possible. For details, refer to the [Reanimated 3 support section](/docs/animations/animations).

:::

While we do provide a seamless integration with Reanimated v2, it comes with two caveats:
* [Animations are executed on the JS thread](#animations-on-the-js-thread)
* [Host Objects](#object-objects)

## Animations on the JS thread

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

## Host Objects

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