---
id: overview
title: Paint Overview
sidebar_label: Overview
slug: /paint/overview
---

Anytime you draw something in Skia, and want to specify what color it is, or how it blends with the background, or what style to draw it in, you specify those attributes in a paint. In React Native Skia, there are many ways to specify a paint which are covering below.

These are the properties that can be assigned to a paint:
* `color`
* `blendMode`
* `style`
* `strokeJoin`
* `strokeCap`
* `strokeMiter`
* `strokeWidth`
* `opacity`

A paint component can additionnaly receive the following components as children:
* `Shader`
* `ImageFilter`
* `ColorFilter`
* `MaskFilter`
* `PathEffect`

The paint component is inherited by the following sibling and descendants.
In the example below, the first circle will be filled with red and the second circle will have a light blue stroke.  

```tsx twoslash
import {Canvas, Circle, Paint, Group} from "@shopify/react-native-skia";

export const PaintDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Paint color="lightblue" />
      <Circle cx={50} cy={50} r={50} />
      <Paint color="lightblue" style="stroke" strokeWidth={10} />
      {/* The paint is inherited by the following sibling and descendants. */}
      <Group transform={[{ translateX: 100 }]}>
        <Circle cx={50} cy={50} r={50} />
      </Group>
    </Canvas>
  );
};
```

Alternatively, properties of a paint component can be assigned a shape directly.
If you assign these properties to a Group component, these properties will be inherited by children.
The example below produces the same result as above.

```tsx twoslash
import {Canvas, Circle, Paint, Group} from "@shopify/react-native-skia";

export const PaintDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={50} cy={50} r={50} color="red" />
      {/* The paint is inherited by the following sibling and descendants. */}
      <Group
        transform={[{ translateX: 100 }]}
        color="lightblue"
        style="stroke"
        strokeWidth={10}
      >
        <Circle cx={50} cy={50} r={50} />
      </Group>
    </Canvas>
  );
};
```

You can also use the Paint component as child of a Shape.
This is useful if you want to draw a shape with many different fills and strokes.

```tsx twoslash
import {Canvas, Circle, Paint} from "@shopify/react-native-skia";

export const PaintDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={50} cy={50} r={50}>
        <Paint color="lightblue" />
        <Paint color="black" style="stroke" strokeWidth={10} />
      </Circle>
    </Canvas>
  );
};
```

Finally, we can can assign a ref to a Paint component for later use.
There a few use-cases where this is useful.
By wrapping the Paint component into a Defs component, we make sure that the paint is not used automatically by the renderer: need to pass the paint explicitly as a property.

```tsx twoslash
import {Canvas, Circle, Paint, Defs, usePaintRef} from "@shopify/react-native-skia";

export const PaintDemo = () => {
  const paint = usePaintRef();
  return (
    <Canvas style={{ flex: 1 }}>
        {/* The Defs component prevents the Paint from being used directly */}
        <Defs>
          <Paint ref={paint} color="lightblue" />
        </Defs>
        {/* We can assign the ref to any shape. This will be handy in advanced use-case */}
        <Circle paint={paint} cx={50} cy={50} r={50} />
    </Canvas>
  );
};
```