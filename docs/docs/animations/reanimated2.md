---
id: reanimated2
title: Reanimated 2
sidebar_label: Reanimated 2
slug: /animations/reanimated2
---

:::info

The Reanimated 2 integration operates on the JS thread. We recommend using Reanimated 3 when possible for better performance and features. For more details, refer to the [Reanimated 3 support section](/docs/animations/animations).

:::

While Reanimated v2 is fully integrated and functional, there are two important caveats to consider:
* [Animations are executed on the JS thread](#animations-on-the-js-thread)
* [Working with Host Objects](#working-with-host-objects)

## Animations on the JS Thread

In the example below, the animation runs on the JS thread due to the use of Reanimated v2, even though the animation itself is fairly simple.

```tsx twoslash
import {useEffect} from "react";
import {Canvas, Rect, mix} from "@shopify/react-native-skia";
import {useSharedValue, withRepeat, withTiming, useDerivedValue} from "react-native-reanimated";

const MyComponent = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, [progress]);

  const x = useDerivedValue(() => {
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

## Working with Host Objects

When your animation involves Skia objects and Reanimated v2, you must ensure that the code explicitly runs on the JS thread. To facilitate this, you can use the `useDerivedValueOnJS` hook.

```tsx twoslash
import {useDerivedValueOnJS, Skia} from "@shopify/react-native-skia";
import {useDerivedValue, useSharedValue} from "react-native-reanimated";

const path = Skia.Path.MakeFromSVGString("M 344 172 Q 344 167 343.793 163")!;
const path2 = Skia.Path.MakeFromSVGString("M 347 169 Q 344 167 349 164")!;

const progress = useSharedValue(0.5);

// ❌ This will crash as it's running on the worklet thread
useDerivedValue(() => path.interpolate(path2, progress.value));

// ✅ This will work as expected since it runs on the JS thread
useDerivedValueOnJS(() => path.interpolate(path2, progress.value), [progress]);
```

Similarly, when using host objects inside a gesture handler, ensure that its execution is on the JS thread:

```tsx twoslash
import {vec} from "@shopify/react-native-skia";
import {Gesture} from "react-native-gesture-handler";
import {useSharedValue} from "react-native-reanimated";

const pos = useSharedValue(vec(0, 0));

// ❌ This will crash as it's running on the worklet thread
Gesture.Pan().onChange(e => pos.value = vec(e.x, 0));

// ✅ This will work as expected since it runs on the JS thread
Gesture.Pan().runOnJS(true).onChange(e => pos.value = vec(e.x, 0));
```