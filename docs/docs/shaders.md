---
id: shaders
title: Shaders
sidebar_label: Shaders
slug: /shaders
---

import {Example} from "../src/components/Example";

Below are some of the shaders available.

## Image

Returns an image as a shader with the specified tiling.
It will use cubic sampling.

| Name       | Type           |  Description                       |
|:-----------|:---------------|:-----------------------------------|
| source      | `ReturnType<typeof require>` | Source of the image |
| tx?         | `TileMode`   | Can be `clamp`, `repeat`, `mirror`, or `decal`. |
| ty?         | `TileMode`   | Can be `clamp`, `repeat`, `mirror`, or `decal`. |
| fm?         | `FilterMode` | Can be `linear` or `nearest`. |
| mm?         | `MipmapMode` | Can be `none`, `linear` or `nearest`. |
| fit?        | `Fit` | Calculate the transformation matrix to fit the rectangle defined by `fitRect`. See [images](images). |
| fitRect     | `IRect` | The destination reactangle to calculate the transformation matrix via the `fit` property. |
| transform?  | `Transforms2d` | see [transformations](transformations). |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Paint,
  Circle,
  ImageShader,
  Skia,
  Shader,
} from "@shopify/react-native-skia";

export const ImageShaderDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Paint>
        <ImageShader
          source={require("../../assets/oslo.jpg")}
          fit="cover"
          fitRect={{ x: 0, y: 0, width: 256, height: 256 }}
        />
      </Paint>
      <Circle cx={128} cy={128} r={128} />
    </Canvas>
  );
};
```
### Result
![Image Shader](assets/shaders/image-shader.png)

## Linear Gradient

Returns a shader that generates a linear gradient between the two specified points.

| Name       | Type           |  Description                    |
|:-----------|:---------------|:--------------------------------|
| start      | `Point`        | Start position of the gradient. |
| end        | `Point`        | End position of the gradient.   |
| colors     | `string[]`     | Colors to be distributed between start and end. |
| positions? | `number[]`     | The relative positions of colors. If supplied must be same length as colors. |
| mode?      | `TileMode`     | Can be `clamp`, `repeat`, `mirror`, or `decal`. |
| flags?     | `number`       | By default gradients will interpolate their colors in unpremul space and then premultiply each of the results. By setting this to 1, the gradients will premultiply their colors first, and then interpolate between them. |
| transform? | `Transforms2d` | see [transformations](transformations). |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Paint,
  Rect,
  LinearGradient,
  Skia,
  Shader,
  vec
} from "@shopify/react-native-skia";

export const LinearGradientDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Paint>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(256, 256)}
          colors={["blue", "yellow"]}
        />
      </Paint>
      <Rect x={0} y={0} width={256} height={256} />
    </Canvas>
  );
};
```
### Result
![Linear Gradient](assets/shaders/linear-gradient.png)

## Radial Gradient

## Two Point Conical Gradient

## Sweep Gradient

## Blend Shader

## Color Shader

## Fractal Perlin Noise Shader

## Turbulence Perlin Noise Shader