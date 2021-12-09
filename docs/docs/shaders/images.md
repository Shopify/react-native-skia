---
id: images
title: Image Shaders
sidebar_label: Images
slug: /shaders/images
---

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
| transform? | `Transforms2d` | see [transformations](/docs/group#transformations). |

### Example
```tsx twoslash
import {
  Canvas,
  Paint,
  Circle,
  ImageShader,
  Skia,
  Shader,
} from "@shopify/react-native-skia";

const ImageShaderDemo = () => {
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
![Image Shader](assets/image.png)
