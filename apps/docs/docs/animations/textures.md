---
id: textures
title: Textures
sidebar_label: Textures
slug: /animations/textures
---

In React Native Skia, we can use Reanimated to create textures on the UI thread directly.

## `useTexture`

This hook allows you to allows you to create textures from React elements.
It takes a React element and the dimensions of the texture as arguments and returns a Reanimated shared value that contains the texture.

```tsx twoslash
import { useWindowDimensions } from "react-native";
import { useTexture } from "@shopify/react-native-skia";
import { Image, Rect, rect, Canvas, Fill } from "@shopify/react-native-skia";
import React from "react";

const Demo = () => {
  const {width, height} = useWindowDimensions();
  const texture = useTexture(
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

## `useImageAsTexture`

This hook allows you to upload an image to the GPU.
It accepts an image source as argument.
It will first load the image from its source and then upload it to the GPU.

```tsx twoslash
import { useWindowDimensions } from "react-native";
import { useImageAsTexture } from "@shopify/react-native-skia";
import { Image, Rect, rect, Canvas, Fill } from "@shopify/react-native-skia";
import React from "react";

const Demo = () => {
  const {width, height} = useWindowDimensions();
  const texture = useImageAsTexture(
    require("./assets/image.png")
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={texture} rect={{ x: 0, y: 0, width, height }} />
    </Canvas>
  )
}
```

## `usePictureAsTexture`

The hook allows you to create a texture from an `SkPicture`.
This is useful to either generate the drawing commands outside the React lifecycle or using the imperative API to build a texture.

```tsx twoslash
import {useWindowDimensions} from "react-native";
import { usePictureAsTexture } from "@shopify/react-native-skia";
import { Image, Rect, rect, Canvas, Fill, Skia } from "@shopify/react-native-skia";
import React from "react";

const rec = Skia.PictureRecorder();
const canvas = rec.beginRecording();
canvas.drawColor(Skia.Color("cyan"));
const picture = rec.finishRecordingAsPicture();

const Demo = () => {
  const {width, height} = useWindowDimensions();
  const texture = usePictureAsTexture(
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
