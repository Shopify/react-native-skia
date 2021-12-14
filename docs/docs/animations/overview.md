---
id: overview
title: Animations
sidebar_label: Overview
slug: /animations/overview
---

# Animations

React Native Skia supports Animations through properties. Each property in all our declarative elements can be animated by providing a callback that calculates the property value instead of the value directly.

## Example

Let's say we have a rectangle that we want to animate along its x-axis over time.

We'll start of by modifying a simple example that paints a red rectangle on the screen:

```tsx twoslash
import { Canvas, Rect } from "@shopify/react-native-skia";

const myComponent = () => {
  return (
    <Canvas>
      <Rect x={100} y={100} width={10} height={10} color={"red"} />
    </Canvas>
  );
};
```

To set up the animation we need an animation value that changes over time and knows how to notify the `Canvas` about its animation.

We also need an `Animation` to provide new values to the animation value over time. A progress animation makes sense here - as it will update the animation value with the number of seconds passed since it was started.

```tsx twoslash
import {
  Canvas,
  Rect,
  interpolate,
  useProgress,
} from "@shopify/react-native-skia";

const myComponent = () => {
  const progress = useProgress();
  return (
    <Canvas>
      <Rect
        x={(ctx) => interpolate(progress.value, [0, 1000], [0, ctx.width])}
        y={100}
        width={10}
        height={10}
        color={"red"}
      />
    </Canvas>
  );
};
```

### Animation value

The animation value can be used in animations and in property callbacks.

The value contained in an animation value can be read/written to using its `value` property:

```tsx
const progress = useValue(1000);
const actualValue = progress.value; // actual value is 1000.
```

### useProgress

The `useProgress` hook will start an animation and return an animation value. The hook takes no parameters.

### useTiming

The `useTiming` hook will create a timing based animation that changes the returned animation value over a given duration.

### useSpring

The `useSpring` hook will create a spring based animation that changes the returned animation value with the results from doing a physics simulation.

### useTouchHandler

There is also a convinient hook for handling touches in the `SkiaViews`. This hook works well with animation values.

```tsx twoslash
import {
  Canvas,
  Circle,
  useValue,
  useTouchHandler,
} from "@shopify/react-native-skia";

const MyComponent = () => {
  const cx = useValue(100);
  const cy = useValue(100);

  const touchHandler = useTouchHandler({
    onActive: ({ x, y }) => {
      cx.value = x;
      cy.value = y;
    },
  });

  return (
    <Canvas style={{ flex: 1 }} onTouch={touchHandler}>
      <Circle cx={() => cx.value} cy={() => cy.value} r={10} color="red" />
    </Canvas>
  );
};
```

In the above example we can see that we are creating the `touchHandler` callback using the `useTouchHandler` hook - which can be provided as the onTouch callback on the `Canvas` or `SkiaView`.

The hook has the following callbacks:

- onStart - called when a touch is received
- onActive - called when an existing touch is moved
- onEnd - called when a touch is ended or cancelled.

A `SkiaView` or `Canvas` will automatically get a repaint request when it receives touches, so there is no need to repaint manually or start animations to update the view.

## Animation system

The animation value will (when it is part of a Skia drawing tree) notify the underlying `SkiaView` that it has an active animation. This will change the drawing mode of the `SkiaView` so that is continuously redraws itself until there are no more animations running in the view.

Each time the view is repainted it will look at its properties and see if any of them are declared as callbacks. For the example above we did exactly this - the `x` property is a callback and will be re-evaluated on repaint.

In the callback we are reading the current value of `progress`, and since it has an active animation it will return the animation's updated value - and the `x` property callback can interpolate this value and return a new position that moves the `Rect` across the x-axis.
