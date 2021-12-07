---
id: image-filters
title: Image Filters
sidebar_label: Image Filters
slug: /image-filters
---

Image filters are effects that operate on all the color bits of pixels that make up an image.

## Blur

Creates an image filter that blurs its input by the separate X and Y sigmas.
The provided tile mode is used when the blur kernel goes outside the input image.

| Name      | Type          |  Description                                                  |
|:----------|:--------------|:--------------------------------------------------------------|
| sigmaX    | `number`      | The Gaussian sigma value for blurring along the X axis.       |
| sigmaY    | `number`      | The Gaussian sigma value for blurring along the Y axis.       |
| mode?     | `TileMode`    | `mirror`, `repeat`, `clamp`, or `decal` (default is `decal`). |
| children? | `ImageFilter` | Optional image filter to be applied first.                    | 

## Simple Blur

```tsx twoslash
import { Canvas, Paint, Blur, Image } from "@shopify/react-native-skia";

const BlurImageFilter = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Paint>
        <Blur sigmaX={4} sigmaY={4} />
      </Paint>
      <Image
        x={0}
        y={0}
        width={256}
        height={256}
        source={require("./assets/oslo.jpg")}
        fit="cover"
      />
    </Canvas>
  );
};
```

![Simple Blur](assets/image-filters/decal-blur.png)

### With mode="clamp"

![Clamp Blur](assets/image-filters/clamp-blur.png)

### Composing Filters

```tsx twoslash
import { Canvas, Paint, Blur, Image, ColorMatrix } from "@shopify/react-native-skia";

const ComposeImageFilter = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Paint>
        <Blur sigmaX={2} sigmaY={2} mode="clamp">
          <ColorMatrix
            value={[
              -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015,
              1.69, -0.703, 0, 0, 0, 0, 0, 1, 0,
            ]}
          />
        </Blur>
      </Paint>
      <Image
        x={0}
        y={0}
        width={256}
        height={256}
        source={require("./assets/oslo.jpg")}
        fit="cover"
      />
    </Canvas>
  );
};
```

![Clamp Blur](assets/image-filters/color.png)
