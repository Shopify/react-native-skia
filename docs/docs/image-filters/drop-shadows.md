---
id: drop-shadows
title: Drop Shadows
sidebar_label: Drop Shadows
slug: /image-filters/drop-shadows
---

The `DropShadow` image filter is equivalent to its [SVG counterpart](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow()).
It creates a filter that draws a drop shadow under the input content.
There is a `shadowOnly` property that renders the drop shadow excluding the input content.


| Name        | Type          |  Description                                                  |
|:------------|:--------------|:--------------------------------------------------------------|
| dx          | `number`      | The X offset of the shadow.                                   |
| dy          | `number`      | The Y offset of the shadow.                                   |
| blur        | `number`      | The blur radius for the shadow                                |
| color       | `Color`       | The color of the drop shadow                                  |
| cropRect    | `IRect`       | Optional rectangle that crops the input and output            |
| shadowOnly? | `boolean`     | If true, the result does not include the input content        | 
| children?   | `ImageFilter` | Optional image filter to be applied first                     | 

## Example

The example below creates two drop shadows.
It is equivalent to the following CSS notation

```css
.paint {
  filter: drop-shadow(12px 12px 25px #93b8c4) drop-shadow(-12px -12px 25px #c7f8ff);
}
```

```tsx twoslash
import {
  DropShadow,
  Fill,
  Group,
  Paint,
  RoundedRect,
  Canvas
} from "@shopify/react-native-skia";

const Neumorphism = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill color="lightblue" />
      <Group>
        <Paint>
          <DropShadow dx={12} dy={12} blur={25} color="#93b8c4" />
          <DropShadow dx={-12} dy={-12} blur={25} color="#c7f8ff" />
        </Paint>
        <RoundedRect x={32} y={32} width={192} height={192} rx={32} color="lightblue" />
      </Group>
    </Canvas>
  );
};
```

### Result

![Drop Shadow](assets/drop-shadow.png)
