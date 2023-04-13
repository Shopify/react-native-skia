---
id: animations
title: Animations
sidebar_label: Animations
slug: /animations/animations
---

:::info

Currently, built-in Skia animations are dependant on the JS thread.
For UI-thread animations with Reanimated 3, see [Reanimated support](/docs/animations/reanimated).

:::

To ease building animation, the library provides some utilities to help you. There are two types of utility functions - imperative functions and hooks.

If you have a Skia Value that you want to animate declaratively, a hook is the best choice.

In the example below, we want the position of the rectangle to animate when we toggle a given value, and we want it to do this with a spring animation.

## Declarative animation

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

## Imperative animation

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
