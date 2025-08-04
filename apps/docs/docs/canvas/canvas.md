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
| style?   | `ViewStyle` | View style |
| ref?   | `Ref<SkiaView>` | Reference to the `SkiaView` object |
| onSize? | `SharedValue<Size>` | Reanimated value to which the canvas size will be assigned  (see [canvas size](/docs/animations/hooks#canvas-size)) |

## Getting the Canvas size

If the size of the Canvas is unknown, there are several ways to access it depending on your architecture and needs:

  * **On the UI thread**, using the [`onSize`](/docs/animations/hooks#canvas-size) prop with [Reanimated](/docs/animations/animations). Pass a shared value to the `onSize` property and it will be automatically updated whenever the canvas size changes.
  * **On the JS thread**:
    * **Fabric architecture**: Use [`measureInWindow`](https://reactnative.dev/docs/the-new-architecture/layout-measurements#measureinwindowcallback) to get the canvas dimensions
    * **Paper architecture**: Use [`onLayout`](https://reactnative.dev/docs/the-new-architecture/layout-measurements) to receive layout updates when the canvas size changes

In the example below, we set the size of the rectangle to the size of the canvas at all times.

```tsx twoslash
import {useSharedValue} from "react-native-reanimated";
import {Fill, Canvas, Rect} from "@shopify/react-native-skia";

const Demo = () => {
  // size will be updated as the canvas size changes
  const size = useSharedValue({ width: 0, height: 0 });
  const rect = useDerivedValue(() => {
    const {width, height} = size.value;
    return { x: 0, y: 0, width, height };
  });
  return (
    <Canvas style={{ flex: 1 }} onSize={size}>
      <Rect color="cyan" rect={rect} />
    </Canvas>
  );
};
```

## Getting a Canvas Snapshot

You can save your drawings as an image by using the `makeImageSnapshotAsync` method. This method returns a promise that resolves to an [Image](/docs/images).
It executes on the UI thread, ensuring access to the same Skia context as your on-screen canvases, including [textures](https://shopify.github.io/react-native-skia/docs/animations/textures).

If your drawing does not contain textures, you may also use the synchronous `makeImageSnapshot` method for simplicity.

### Example

```tsx twoslash
import {useEffect} from "react";
import {Canvas, useCanvasRef, Circle} from "@shopify/react-native-skia";

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
        console.log({ bytes });
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

## Accessibilty

The Canvas component supports the same properties as a View component including its [accessibility properties](https://reactnative.dev/docs/accessibility#accessible).
You can make elements inside the canvas accessible as well by overlayings views on top of your canvas.
This is the same recipe used for [applying gestures on specific canvas elements](https://shopify.github.io/react-native-skia/docs/animations/gestures/#element-tracking).
