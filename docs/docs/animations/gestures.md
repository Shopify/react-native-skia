---
id: touch-events
title: Touch Events
sidebar_label: Touch Events
slug: /animations/touch-events
---


:::info

Currently, built-in Skia animations are dependant on the JS thread.
For UI-thread animations with Reanimated 3, see [Reanimated support](/docs/animations/reanimated).

:::

### useTouchHandler

The `useTouchHandler` hook handles touches in the `Canvas`.
It is meant to be used with values to animate canvas elements.

The useTouchHandler hook provides you with callbacks for single touch events.
To track multiple touches use the `useMultiTouchHandler` hook instead - it has
the same API as the single touch hook.

```tsx twoslash
import {
  Canvas,
  Circle,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";

const MyComponent = () => {
  const cx = useValue(100);
  const cy = useValue(100);

  const touchHandler = useTouchHandler({
    onActive: ({ x, y }) => {
      cx.current = x;
      cy.current = y;
    },
  });

  return (
    <Canvas style={{ flex: 1 }} onTouch={touchHandler}>
      <Circle cx={cx} cy={cy} r={10} color="red" />
    </Canvas>
  );
};
```
