---
id: pictures
title: Pictures
sidebar_label: Pictures
slug: /shapes/pictures
---

A Picture renders a previously recorded list of drawing operations on the canvas. The picture is immutable and cannot be edited or changed after it has been created. It can be used multiple times in any canvas.

| Name    | Type        | Description       |
| :------ | :---------- | :---------------- |
| picture | `SkPicture` | Picture to render |


## Hello World

```tsx twoslash
import React, { useMemo } from "react";
import {
  createPicture,
  Canvas,
  Picture,
  Skia,
  Group,
  BlendMode
} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  // Create a picture
  const picture = useMemo(() => createPicture(
    (canvas) => {
      const size = 256;
      const r = 0.33 * size;
      const paint = Skia.Paint();
      paint.setBlendMode(BlendMode.Multiply);

      paint.setColor(Skia.Color("cyan"));
      canvas.drawCircle(r, r, r, paint);

      paint.setColor(Skia.Color("magenta"));
      canvas.drawCircle(size - r, r, r, paint);

      paint.setColor(Skia.Color("yellow"));
      canvas.drawCircle(size / 2, size - r, r, paint);
    }
  ), []);
  return (
    <Canvas style={{ flex: 1 }}>
      <Picture picture={picture} />
    </Canvas>
  );
};
```

<img src={require("/static/img/simple-picture.png").default} width="256" height="256" />

## Applying Effects

The `Picture` component doesn't follow the same painting rules as other components.
However you can apply effets using the `layer` property.
For instance, in the example below, fopr  we apply a blur image filter.

```tsx twoslash
import React from "react";
import { Canvas, Skia, Group, Paint, Blur, createPicture, BlendMode, Picture } from "@shopify/react-native-skia";

const width = 256;
const height = 256;

export const Demo = () => {
  const picture = createPicture(
    (canvas) => {
      const size = 256;
      const r = 0.33 * size;
      const paint = Skia.Paint();
      paint.setBlendMode(BlendMode.Multiply);

      paint.setColor(Skia.Color("cyan"));
      canvas.drawCircle(r, r, r, paint);

      paint.setColor(Skia.Color("magenta"));
      canvas.drawCircle(size - r, r, r, paint);

      paint.setColor(Skia.Color("yellow"));
      canvas.drawCircle(size / 2, size - r, r, paint);
    }
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Group layer={<Paint><Blur blur={10} /></Paint>}>
        <Picture picture={picture} />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/blurred-picture.png").default} width="256" height="256" />


## Serialization

You can serialize a picture to a byte array.
Serialized pictures are only compatible with the version of Skia it was created with.
You can use serialized pictures with the [Skia debugger](https://skia.org/docs/dev/tools/debugger/).

```tsx twoslash
import React, { useMemo } from "react";
import {
  createPicture,
  Canvas,
  Picture,
  Skia,
  Group,
} from "@shopify/react-native-skia";

export const PictureExample = () => {
  // Create picture
  const picture = useMemo(() => createPicture(
    (canvas) => {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("pink"));
      canvas.drawRect({ x: 0, y: 0, width: 100, height: 100 }, paint);

      const circlePaint = Skia.Paint();
      circlePaint.setColor(Skia.Color("orange"));
      canvas.drawCircle(50, 50, 50, circlePaint);
    },
    { width: 100, height: 100 },
  ), []);

  // Serialize the picture
  const serialized = useMemo(() => picture.serialize(), [picture]);

  // Create a copy from serialized data
  const copyOfPicture = useMemo(
    () => (serialized ? Skia.Picture.MakePicture(serialized) : null),
    [serialized]
  );

  return (
    <Canvas style={{ flex: 1 }}>
      <Picture picture={picture} />
      <Group transform={[{ translateX: 200 }]}>
        {copyOfPicture && <Picture picture={copyOfPicture} />}
      </Group>
    </Canvas>
  );
};
```

## Instance Methods

| Name       | Description                                                                   |
| :--------- | :---------------------------------------------------------------------------- |
| makeShader | Returns a new shader that will draw with this picture.                        |
| serialize  | Returns a UInt8Array representing the drawing operations stored in the image. |
