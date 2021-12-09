---
id: group
title: Group
sidebar_label: Group
slug: /group
---

The Group component is an important construct in React Native Skia.
Group components can be deeply nested with one another.
It can apply the following operations to its children:
* [Paint properties](#paint-properties)
* [Transformations](#transformation)
* [Clipping operations](#clipping-operations)
* [Bitmap Effects](#bitmap-effects)

| Name       | Type               |  Description                                                  |
|:-----------|:-------------------|:--------------------------------------------------------------|
| transform? | `Transform2d`      | [Same API than in React Native](https://reactnative.dev/docs/transforms). The default origin of the transformation is however different. It is the center object in React Native and the top-left corner in Skia. |
| origin?    | `Point`            | Sets the origin of the transformation. This property is not inherited by its children. |
| clipRect?   | `RectOrRRect`     | Rectangle or rounded rectangle to use to clip the children. |
| clipPath?   | `Path or string`  | Path to use to clip the children |
| invertClip? | `boolean`         | Invert the clipping region: parts outside the clipping region will be shown and, inside will be hidden. |
| rasterize? | `RefObject<Paint>` | Draws the children as a bitmap and apply the effects provided by the paint. |

## Paint Properties

All paint properties applied to a group will be inherited by its children.

```tsx twoslash
import {Canvas, Circle, Paint, Group} from "@shopify/react-native-skia";
 
export const PaintDemo = () => {
  const r = 128;
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={r} cy={r} r={r} color="red" />
      {/* The paint is inherited by the following sibling and descendants. */}
      <Group color="lightblue" style="stroke" strokeWidth={10}>
        <Circle cx={r} cy={r} r={r / 2} />
        <Circle cx={r} cy={r} r={r / 3} color="white" />
      </Group>
    </Canvas>
  );
};
```

## Transformations

The transform property is identical to its [homonymous property in React Native](https://reactnative.dev/docs/transforms) except for one major difference: in React Native the origin of transformation is the center of the object whereas it is the top left position of the object in Skia.


The origin property is an helper to set the origin of the transformation. This property is not inherited by its children.

## Clipping Operations

`clipRect` or `clipPath` provide a clipping region that sets what part of the children should be shown.
Parts that are inside the region are shown, while those outside are hidden. Using `invertClip`, parts outside the clipping region will be shown and parts inside will be hidden.

## Bitmap Effects

Using the `rasterize` property will create a bitmap drawing of the children to which you can apply effects.
This is particularly useful to build effects that need to be applied to a group of elements and not one in particular.