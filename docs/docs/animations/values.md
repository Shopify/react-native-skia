---
id: values
title: Values
sidebar_label: Values
slug: /animations/values
---

React Native Skia supports Animations through the concept of Skia Values. A value can be seen as the state in the library where a change in will trigger a repaint request on the `Canvas` component where it is used.

A simple example below shows how a value is used as a property for the x position of the `Rect` element.

```tsx twoslash
import { Canvas, Rect, useValue } from "@shopify/react-native-skia";
import { useCallback } from "react";
import { Button } from "react-native";

const MyComponent = () => {
  const position = useValue(0);
  const updateValue = useCallback(
    () => (position.current = position.current + 10),
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

## Skia Values

The basic `SkiaValue` is a value that stores some kind of Javascript value. It can be used to store numbers, strings, booleans, objects and even arrays:

```tsx twoslash
import { useValue } from "@shopify/react-native-skia";
const progress = useValue({ x: 100, y: 100 });
const actualValue = progress.current; // actualValue is now {x: 100, y: 100}
```

There are a few more value types in the library that will be described below.

## Derived value

This value is a Skia Value that is derived from other Skia Values.
It takes one or more existing values and a function that will calculate the new value based on the input. The function will be evaluated every time the input value changes.

```tsx twoslash
import { useValue, useDerivedValue } from "@shopify/react-native-skia";

const radius = useValue(100);
const theta = useValue(Math.PI);
const length = useDerivedValue(() => radius.current * theta.current, [radius, theta]);
console.log(length.current); // 314.1592653589793
```

## Clock Value

This value is a value that updates on every display frame on the device.
The value will be updated with the number of milliseconds elapsed since it was started.

```tsx twoslash
import {
  useClockValue,
  Canvas,
  Circle,
  useDerivedValue,
} from "@shopify/react-native-skia";

const interval = 3000;

const Demo = () => {
  const clock = useClockValue();
  const opacity = useDerivedValue(
    () => {
      return (clock.current % interval) / interval;
    },
    [clock]
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle r={100} cx={100} cy={100} color="black" opacity={opacity} />
    </Canvas>
  );
};
```

## Canvas Size

The `useCanvasSize` hook is a value that updates every time the canvas size updates.


:::caution

`useCanvasSize` can only be used inside the Canvas element because it relies on context.

:::

```tsx twoslash
import React from "react";
import {
  Canvas,
  Fill,
  Group,
  Rect,
  rect,
  useCanvasSize,
  useDerivedValue,
} from "@shopify/react-native-skia";

const MyComp = () => {
  // 💚 useCanvasSize() can safely be used here
  const canvas = useCanvasSize();
  const rct = useDerivedValue(() => {
    return rect(0, 0, canvas.current.width, canvas.current.height / 2);
  }, [canvas]);
  return (
    <Group>
      <Fill color="magenta" />
      <Rect color="cyan" rect={rct} />
    </Group>
  );
};

const Example = () => {
  // ❌ Using useCanvasSize() here would crash
  return (
    <Canvas style={{ flex: 1 }}>
      <MyComp />
    </Canvas>
  );
};

```


## Value Effect

The `useValueEffect` hook allows you to execute change on value change.
In the example below we execute a callback on every frame (every time the clock value changes).

```tsx twoslash
import React, { useEffect } from "react";
import {Animated} from "react-native";
import {
  Canvas,
  Rect,
  mix,
  useClockValue,
  useValueEffect,
  useValue,
  interpolate
} from "@shopify/react-native-skia";

export const Demo = () => {
  const clock = useClockValue();
  const x = useValue(0);

  useValueEffect(clock, () => {
    x.current = interpolate(clock.current, [0, 4000], [0, 200]);
  });
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={x} y={100} width={10} height={10} color="red" />
    </Canvas>
  );
};
```