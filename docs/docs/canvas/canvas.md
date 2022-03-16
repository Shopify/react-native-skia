---
id: canvas
title: Canvas
sidebar_label: Overview
slug: /canvas/overview
---

The Canvas component is the root of your Skia drawing.
You can treat it as a regular React Native view and assign a view style.
Behind the scenes, it is using its own React renderer.

| Name | Type     |  Description.    |
|:-----|:---------|:-----------------|
| style   | `ViewStyle` | View style. |
| ref?   | `Ref<SkiaView>` | Reference to the `SkiaView` object |
| onTouch?    | `TouchHandler` | Touch handler for the Canvas (see [touch handler](/docs/animations/touch-events#usetouchhandler)).        |

## Getting a Canvas Snapshot

You can save your drawings as an image, using `makeImageSnapshot`. This method will return an [Image instance](/docs/images#instance-methods). This instance can be used to do anything: drawing it via the `<Image>` component, or being saved or shared using binary or base64 encoding.

### Example

```tsx twoslash
import {useEffect} from "react";
import {Canvas, Image, useCanvasRef, Circle} from "@shopify/react-native-skia";

export const Demo = () => {
  const ref = useCanvasRef();
  useEffect(() => {
    setTimeout(() => {
      // you can pass an optional rectangle
      // to only save part of the image
      const image = ref.current?.makeImageSnapshot();
      if (image) {
        // you can use image in an <Image> component
        // Or save to file using encodeToBytes -> Uint8Array
        const bytes = image.encodeToBytes();
      }
    }, 1000)
  });
  return (
    <Canvas style={{ flex: 1 }} ref={ref}>
      <Circle r={128} cx={128} cy={128} color="red" />
    </Canvas>
  );
};
```


