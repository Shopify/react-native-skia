---
id: image-svg
title: Image SVG
sidebar_label: SVG
slug: /images-svg
---

Draw an SVG

| Name      | Type      |  Description                                                  |
|:----------|:----------|:--------------------------------------------------------------|
| source    | `require` or `string` | Source of the SVG or an HTTP(s) URL. |
| width?     | `number`  | Width of the destination image.                               |
| height?    | `number`  | Height of the destination image.                              |

### Example

```tsx twoslash
import {
  Canvas,
  ImageSVG,
  useSVG
} from "@shopify/react-native-skia";

const ImageSVGDemo = () => {
  // Alternatively, you can pass an image URL directly
  // for instance: const source = useSVG("https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg");
  const source = useSVG(require("../../assets/tiger.svg"));
  return (
    <Canvas style={{ flex: 1 }}>
      { source && (
        <ImageSVG
          source={source}
          width={256}
          height={256}
        />)
      }
    </Canvas>
  );
};
```
