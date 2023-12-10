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
    }
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
