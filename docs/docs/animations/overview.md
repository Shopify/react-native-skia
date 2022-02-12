---
id: overview
title: Animations
sidebar_label: Overview
slug: /animations/overview
---

# Animations

React Native Skia supports Animations through animations values. An animation value can be seen as the state in the library - where a change in a value will trigger a repaint request on the `Canvas` component where it is used.

A simple example is shown below shows how a value is used as a property for the x position of the `Rect` element.

```tsx twoslash
import { Canvas, Rect, useValue } from "@shopify/react-native-skia";
import { useCallback } from "react";
import { Button } from "react-native";

const MyComponent = () => {
  const position = useValue(0);
  const updateValue = useCallback(
    () => (position.value = position.value + 10),
    [position]
  );

  return (
    <>
      <Canvas style={{ flex: 1 }}>
        <Rect x={position} y={100} width={10} height={10} color={"red"} />
      </Canvas>
      <Button title="Move it" onPress={updateValue} />
    </>
  );
};
```

## Values

The basic `value` shown above is a value that stores some kind of Javascript value. It can be used to store numbers, strings, booleans, objects and even arrays:

```tsx twoslash
import { useValue } from "@shopify/react-native-skia";
const progress = useValue({ x: 100, y: 100 });
const actualValue = progress.value; // actualValue is now {x: 100, y: 100}
```

There are a few more value types in the library that will be described below.

### Derived value

This value is a value that is derived from other values. It takes as its input an existing
value and a function that will calculate the new value based on the input. The function will be evaluated every time the input value changes.

```tsx twoslash
import { useValue, useDerivedValue } from "@shopify/react-native-skia";

const progress = useValue(100);
const derived = useDerivedValue((p) => p * 10, [progress]);
const actualValue = derived.value; // actualValue is now 1000
progress.value = 200; // derived.value is now 2000
```

| **NOTE:** You can use multiple values as inputs to a derived value.

### AnimationValue

This value is a value that updates on every display frame on the device. It can be used to derive values and drive animations.

The animation value will be updated with the number of seconds elapsed since it was started.

## Animation

The ´Canvas´ component knows about values and will register any animation value used in the component or its child components so that changes in any value will trigger a repaint request like we saw in the first example.

By combining animation values and derived values we can build a simple animation with React Native Skia:

```tsx twoslash
import {
  Canvas,
  Rect,
  useTimestamp,
  useDerivedValue,
} from "@shopify/react-native-skia";

const MyComponent = () => {
  const timestamp = useTimestamp();
  const position = useDerivedValue(
    (p) => ((p / 1000) % 1.0) * 100,
    [timestamp]
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={position} y={100} width={10} height={10} color={"red"} />
    </Canvas>
  );
};
```

In this example we are using the animation value to drive a derived value which in turn is used in the `Rect` component to set the position on the x axis. Since the animation value will be updated on every frame, the position value will be recalculated and notify the `Canvas` component that it needs to be repainted.

## Animation utilities

To ease the process of building animation, the library provides some utilities to help you. There are two types of utility functions - imperative functions and hooks.

If you have an animation value that you want to animate declaratively, a hook is the best choice.

In the example below we want the position of the rectangle to animate when we toggle a value, and we want it to do this with a spring animation.

### Declarative animation

```tsx twoslash
import React, { useState } from "react";
import { Canvas, Rect, useSpring } from "@shopify/react-native-skia";
import { Button, StyleSheet } from "react-native";

export const AnimationExample = () => {
  const [toggled, setToggled] = useState(false);
  const position = useSpring(toggled ? 100 : 0);
  return (
    <>
      <Canvas style={{ flex: 1 }}>
        <Rect x={position} y={100} width={10} height={10} color={"red"} />
      </Canvas>
      <Button title="Toggle" onPress={() => setToggled((p) => !p)} />
    </>
  );
};
```

### Imperative animation

Almost the same thing can be accomplished with an imperative function (except that we are not toggling back and forth in this example):

```tsx twoslash
import { Canvas, Rect, runSpring, useValue } from "@shopify/react-native-skia";
import { Button } from "react-native";

export const AnimationExample = () => {
  const position = useValue(0);
  const changePosition = () => runSpring(position, 100);
  return (
    <>
      <Canvas style={{ flex: 1 }}>
        <Rect x={position} y={100} width={10} height={10} color={"red"} />
      </Canvas>
      <Button title="Toggle" onPress={changePosition} />
    </>
  );
};
```

### useTouchHandler

The library has a hook for handling touches in the `Canvas`. This hook works well with animation values:

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
      cx.value = x;
      cy.value = y;
    },
  });

  return (
    <Canvas style={{ flex: 1 }} onTouch={touchHandler}>
      <Circle cx={cx} cy={cy} r={10} color="red" />
    </Canvas>
  );
};
```
