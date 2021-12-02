---
id: helloworld
title: Hello World
sidebar_label: Hello World
slug: /
---

React Native Skia has two APIs: a declarative API available as a React Native Renderer and an imperative API backed by JSI. The recommended way to use this library is via the declarative API. Library developers may take advantage of the imperative API as well to provide custom features built on top of Skia.

## Declarative API

```tsx twoslash
import {Canvas, Circle} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={50} cy={50} r={50} color="blue" />
    </Canvas>
  );
};
```

## Imperative API

```tsx twoslash
import {Skia, SkiaView, useDrawCallback} from "@shopify/react-native-skia";

const paint = Skia.Paint();
paint.setAntiAlias(true);
paint.setColor(Skia.Color("lightblue"))

export const HelloWorld = () => {
  const onDraw = useDrawCallback((canvas) => {
    canvas.drawCircle(50, 50, 50, paint)
  });
  return (
    <SkiaView style={{ flex: 1 }} onDraw={onDraw} />
  );
};
```