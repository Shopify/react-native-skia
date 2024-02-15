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
| image      | `SkImage`      | Image instance. |
| tx?        | `TileMode`     | Can be `clamp`, `repeat`, `mirror`, or `decal`. |
| ty?        | `TileMode`     | Can be `clamp`, `repeat`, `mirror`, or `decal`. |
| fm?        | `FilterMode`   | Can be `linear` or `nearest`. |
| mm?        | `MipmapMode`   | Can be `none`, `linear` or `nearest`. |
| fit?       | `Fit`          | Calculate the transformation matrix to fit the rectangle defined by `fitRect`. See [images](/docs/images). |
| rect?      | `SkRect`       | The destination rectangle to calculate the transformation matrix via the `fit` property. |
| transform? | `Transforms2d` | see [transformations](/docs/group#transformations). |

### Example
```tsx twoslash
import {
  Canvas,
  Circle,
  ImageShader,
  Skia,
  Shader,
  useImage
} from "@shopify/react-native-skia";

const ImageShaderDemo = () => {
  const image = useImage(require("../../assets/oslo.jpg"));
  if (image === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={128} cy={128} r={128}>
        <ImageShader
          image={image}
          fit="cover"
          rect={{ x: 0, y: 0, width: 256, height: 256 }}
        />
      </Circle>
    </Canvas>
  );
};
```
### Result
![Image Shader](assets/image.png)


:::info

If you're loading Images on the Web with the Metro bundler (Expo, etc.), make sure you're [properly loading your assets](https://shopify.github.io/react-native-skia/docs/getting-started/web#loading-assets-on-the-web)

:::