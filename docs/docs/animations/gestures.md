---
id: touch-events
title: Touch Events
sidebar_label: Touch Events
slug: /animations/touch-events
---

## useTouchHandler

The `useTouchHandler` hook handles touches in the `Canvas`.
It is meant to be used with values to animate canvas elements.

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

### Restrict to a specific area

You can restrict the area where you would like to handle the touch.
The area can be a rectangle or a circle and it can be an animation value

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
  const r = r;
  const touchHandler = useTouchHandler({
    onActive: ({ x, y }) => {
      cx.current = x;
      cy.current = y;
    },
  }, { c, r});
  return (
    <Canvas style={{ flex: 1 }} onTouch={touchHandler}>
      <Circle cx={cx} cy={cy} r={r} color="red" />
    </Canvas>
  );
};
```

### Handle multiple areas


```tsx twoslash
import {
  Canvas,
  Circle,
  useTouchHandlers,
  useValue,
} from "@shopify/react-native-skia";

const MyComponent = () => {
  const cx = useValue(100);
  const cy = useValue(100);
  const r = r;
  const touchHandler = useTouchHandlers([
    [
      {
    onActive: ({ x, y }) => {
      cx.current = x;
      cy.current = y;
    },
  }, { c, r}
    ],
    {
    onActive: ({ x, y }) => {
      cx.current = x;
      cy.current = y;
    },
  }, rect
  ]);
  return (
    <Canvas style={{ flex: 1 }} onTouch={touchHandler}>
      <Circle cx={cx} cy={cy} r={r} color="red" />
    </Canvas>
  );
};