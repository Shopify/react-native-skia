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
| mode?   | `default` or `continuous` | By default, the canvas is only updated when the drawing tree or animation values change. With `mode="continuous"`, the canvas will redraw on every frame |
| onSize? | `SharedValue<Size>` | Reanimated value to which the canvas size will be assigned  (see [canvas size](/docs/animations/animations#canvas-size)) |
| onLayout? | `NativeEvent<LayoutEvent>` | Invoked on mount and on layout changes (see [onLayout](https://reactnative.dev/docs/view#onlayout)) |

## Getting the Canvas size

If the size of the Canvas is unknown, there are two ways to access it:
  * **On the JS thread**, using the [`onLayout`](https://reactnative.dev/docs/view#onlayout) prop, like you would on any regular React Native View. 
  * **On the UI thread**, using the [`onSize`](/docs/animations/animations#canvas-size) prop with [Reanimated](/docs/animations/animations).

## Getting a Canvas Snapshot

You can save your drawings as an image, using `makeImageSnapshot`. This method will return an [Image instance](/docs/images#instance-methods). This instance can be used to draw it via the `<Image>` component, or be saved or shared using binary or base64 encoding.

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
<!-- 
## Offscreen rendering

It is also possible directly possible to get an image directly from a drawing using `drawAsImage`.

```tsx twoslash
import {drawAsImage, Circle, Canvas, Image} from "@shopify/react-native-skia";

const width = 256;
const height = 256;
const r = width / 2;
const image = drawAsImage(
  <Circle r={r} cx={r} cy={r} color="lightblue" />,
  width,
  height
);

// Now we can draw the image in a regular canvas or save it to file
export const Demo = () => {
  return (
    <Canvas style={{ width, height }}>
      <Image image={image} x={0} y={0} width={width} height={height} />
    </Canvas>
  );
};
```

The offscreen drawing can also be done directly with the canvas API.

```tsx twoslash
import {Skia, Circle, Canvas, Image} from "@shopify/react-native-skia";

const width = 256;
const height = 256;
const r = width / 2;
const image = Skia.Surface.drawAsImage(
  (canvas) => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    canvas.drawCircle(r, r, r, paint);
  },
  width,
  height
);

// Now we can draw the image in a regular canvas or save it to file
export const Demo = () => {
  return (
    <Canvas style={{ width, height }}>
      <Image image={image} x={0} y={0} width={width} height={height} />
    </Canvas>
  );
};
``` -->


