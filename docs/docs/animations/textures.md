---
id: textures
title: Textures
sidebar_label: Textures
slug: /animations/textures
---

In React Native Skia, Skia resources are shared across threads.
We can use Reanimated to create textures on the UI thread, thus ensuring that we can display them onscreen canvas without needing to perform unnecessary copies.

## `useTextureValue`

The `useTextureValue` hook allows you to create textures from React elements. It takes a React element and its size as arguments, and returns a shared value containing the texture.

```tsx twoslash
import { useWindowDimensions } from "react-native";
import { useTextureValue } from "@shopify/react-native-skia";
import { Image, Rect, rect, Canvas, Fill } from "@shopify/react-native-skia";
import React from "react";

const Demo = () => {
  const {width, height} = useWindowDimensions();
  const texture = useTextureValue(
      <Fill color="cyan" />,
    { width, height }
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={texture} rect={{ x: 0, y: 0, width, height }} />
    </Canvas>
  )
}
```

## `useTextureValueFromPicture`

The `useTextureValueFromPicture` hook is identical to `useTextureValue` but accepts a `SkPicture` as first argument instead of a React element.
This is useful to either generate the drawing commands outside the React lifecycle or using the imperative API to build a texture.


```tsx twoslash
import {useWindowDimensions} from "react-native";
import { useTextureValueFromPicture } from "@shopify/react-native-skia";
import { Image, Rect, rect, Canvas, Fill, Skia } from "@shopify/react-native-skia";
import React from "react";

const rec = Skia.PictureRecorder();
const canvas = rec.beginRecording();
canvas.drawColor(Skia.Color("cyan"));
const picture = rec.finishRecordingAsPicture();

const Demo = () => {
  const {width, height} = useWindowDimensions();
  const texture = useTextureValueFromPicture(
    picture,
    { width, height }
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={texture} rect={{ x: 0, y: 0, width, height }} />
    </Canvas>
  )
}
```

## Under the hood

Reanimated 2 provides a [`runOnUI`](https://docs.swmansion.com/react-native-reanimated/docs/threading/runOnUI) function that enables the execution of JavaScript code on the UI thread. This function is particularly useful for creating GPU textures that can be rendered directly onto an onscreen canvas.

```tsx twoslash
import { useEffect } from "react";
import { runOnUI, useSharedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Skia, Canvas, Image } from "@shopify/react-native-skia";
import type { SkImage } from "@shopify/react-native-skia";

const createTexture = (image: SharedValue<SkImage | null>) => {
  "worklet";
  const surface = Skia.Surface.MakeOffscreen(200, 200)!;
  const canvas = surface.getCanvas();
  canvas.drawColor(Skia.Color("cyan"));
  surface.flush();
  image.value = surface.makeImageSnapshot();
}

const Demo = () => {
  const image = useSharedValue<SkImage | null>(null);
  useEffect(() => {
    runOnUI(createTexture)(image);
  }, []);
  
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={image} x={0} y={0} width={200} height={200} />
    </Canvas>
  );
};
```

This example demonstrates how to create a texture, draw a cyan color onto it, and then display it using the `Image` component from `@shopify/react-native-skia`. The `runOnUI` function ensures that the texture creation and drawing operations are performed on the UI thread for optimal performance.

Make sure that you have installed the necessary packages and configured your project to use Reanimated 2 and `@shopify/react-native-skia` before running this code.