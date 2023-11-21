---
id: textures
title: Textures
sidebar_label: Textures
slug: /animations/textures
---

Reanimated 2 provides a [`runOnUI`](https://docs.swmansion.com/react-native-reanimated/docs/threading/runOnUI) function that enables the execution of JavaScript code on the UI thread. This function is particularly useful for creating GPU textures that can be directly rendered onto an onscreen canvas.

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