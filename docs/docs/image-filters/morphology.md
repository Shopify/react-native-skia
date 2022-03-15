---
id: morphology
title: Morphology
sidebar_label: Morphology
slug: /image-filters/morphology
---

The morphology image filter is identical to its [SVG counterpart](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMorphology).
It is used to erode or dilate the input image.
Its usefulness lies primarily in fattening or thinning effects.

| Name      | Type                 |  Description                                                        |
|:----------|:---------------------|:--------------------------------------------------------------------|
| operator  | `erode` or `dilate`  | whether to erode (i.e., thin) or dilate (fatten). Default is dilate |
| radius    | `number` or `Vector` | Radius of the effect.                                               |
| children? | `ImageFilter`        | Optional image filter to be applied first.                          | 

## Example

```tsx twoslash
import {Canvas, Text, Paint, Morphology} from "@shopify/react-native-skia";

export const MorphologyDemo = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Text
        text="Hello World"
        x={32}
        y={32}
        familyName="sans-serif"
        size={24}
      />
      <Paint>
        <Morphology radius={1} />
      </Paint>
      <Text
        text="Hello World"
        x={32}
        y={64}
        familyName="sans-serif"
        size={24}
      />
      <Paint>
        <Morphology radius={0.3} operator="erode" />
      </Paint>
      <Text
        text="Hello World"
        x={32}
        y={96}
        familyName="sans-serif"
        size={24}
      />
    </Canvas>
  );
};
```

![Morphology Image Filter](./assets/morphology.png)e