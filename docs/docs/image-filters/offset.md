---
id: offset
title: Offset
sidebar_label: Offset
slug: /image-filters/offset
---

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
