---
id: textures
title: Textures
sidebar_label: Textures
slug: /animations/textures
---

Reanimated 2 has a [runOnUI](https://docs.swmansion.com/react-native-reanimated/docs/threading/runOnUI) function that allows you to run JavaScript code on the UI thread.
You can use it to create GPU textures that can be used directly onto onscreen canvas.

```tsx twoslash
import {useEffect} from "react";
import {runOnUI, useSharedValue} from "react-native-reanimated";
import type {SharedValue} from "react-native-reanimated";
import {Skia, Canvas, Image} from "@shopify/react-native-skia";
import type {SkImage} from "@shopify/react-native-skia";


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
  )
};
```