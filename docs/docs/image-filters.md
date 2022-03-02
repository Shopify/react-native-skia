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
| sigmaX    | `number`      | The Gaussian sigma blur value along the X axis.               |
| sigmaY    | `number`      | The Gaussian sigma blur value along the Y axis.               |
| mode?     | `TileMode`    | `mirror`, `repeat`, `clamp`, or `decal` (default is `decal`). |
| children? | `ImageFilter` | Optional image filter to be applied first.                    | 

### Simple Blur

```tsx twoslash
import { Canvas, Paint, Blur, Image, useImage } from "@shopify/react-native-skia";

const BlurImageFilter = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
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
        image={image}
        fit="cover"
      />
    </Canvas>
  );
};
```

![Simple Blur](assets/image-filters/decal-blur.png)

### With mode="clamp"

![Clamp Blur](assets/image-filters/clamp-blur.png)

## Displacement Map

The displacement map image filter is identical to its [SVG counterpart](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap). The pixel values from the child image is used to spatially displace the filtered image.
The formula for the transformation looks like this:

```
P'(x,y) ← P( x + scale * (XC(x,y) - 0.5), y + scale * (YC(x,y) - 0.5))
```

where `P(x,y)` is the child image, in, and `P'(x,y)` is the destination. `XC(x,y)` and `YC(x,y)` are the component values of the channel designated by `channelX` and `channelY`.

| Name      | Type           |  Description                                                                          |
|:----------|:---------------|:--------------------------------------------------------------------------------------|
| channelX  | `ColorChannel` | Color channel to be used along the X axis. Possible values are `r`, `g`, `b`, or `a`. |
| channelY  | `ColorChannel` | Color channel to be used along the X axis. Possible values are `r`, `g`, `b`, or `a`. |
| scale     | `number`       | Displacement scale factor to be used                                                  |
| children? | `ImageFilter`  | Optional image filter to be applied first.                                            | 

### Example

In the example below, we use a [Perlin Noise](/docs/shaders/perlin-noise) as a displacement map.

```tsx twoslash
import { Canvas, Paint, Image, Turbulence, DisplacementMap, useImage } from "@shopify/react-native-skia";

const Filter = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Paint>
        <DisplacementMap channelX="r" channelY="a" scale={20}>
          <Turbulence freqX={0.01} freqY={0.05} octaves={2} />
        </DisplacementMap>
      </Paint>
      <Image
        image={image}
        x={0}
        y={0}
        width={256}
        height={256}
        fit="cover"
      />
    </Canvas>
  );
};
```

## Offset

This offset filter is identical to its [SVG counterpart](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap). It allow to offset the filtered image. 

| Name      | Type           |  Description                               |
|:----------|:---------------|:-------------------------------------------|
| x         | `number`       | Offset along the X axis.                   |
| y         | `number`       | Offset along the Y axis.                   |
| children? | `ImageFilter`  | Optional image filter to be applied first. | 

### Example

```tsx twoslash
import { Canvas, Paint, Image, Offset, useImage } from "@shopify/react-native-skia";

const Filter = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Paint>
        <Offset x={30} />
      </Paint>
      <Image
        image={image}
        x={0}
        y={0}
        width={256}
        height={256}
        fit="cover"
      />
    </Canvas>
  );
};
```

## Composing Filters

Color Filters and Shaders and also be used as Image filters.
In the example below, we first apply a color matrix to the content and then a blur image filter.

```tsx twoslash
import { Canvas, Paint, Blur, Image, ColorMatrix, useImage } from "@shopify/react-native-skia";

const ComposeImageFilter = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Paint>
        <Blur sigmaX={2} sigmaY={2} mode="clamp">
          <ColorMatrix
            matrix={[
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
        image={image}
        fit="cover"
      />
    </Canvas>
  );
};
```

![Clamp Blur](assets/image-filters/color.png)
