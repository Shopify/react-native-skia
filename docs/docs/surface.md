---
id: surface
title: Surface
sidebar_label: Surface
slug: /surfaces
---

Surface is represents a surface that can be drawn on. A surface has a canvas where the actual drawing happens.

When drawing imperatively or by using the Skia components a surface has already been created for you. This surface
is not available since it is not a Javascript component but a GPU backed surface.

If you want to draw offscreen you can create your own surface and draw on it. Remember that this surface will be
backed by memory and will not be GPU accelerated.

### Example

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";

const generateImage = () => {
  const surface = Skia.Surface.Make(200, 100);
  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  paint.setColor(Skia.Color("red"));
  canvas.drawPaint(paint);
  const image = surface.makeImageSnapshot();
  return image.toByteData();
};
```

### Methods

| Name              | Description                                                                                                                                                                                 | Comment |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------ |
| Make              | Returns a CPU backed surface with the given dimensions, an SRGB colorspace, Unpremul-alphaType and 8888 color type. The pixels belonging to this surface will be in memory and not visible. | static  |
| getCanvas         | Returns Canvas that draws into the surface.                                                                                                                                                 |         |
| makeImageSnapshot | Returns Image capturing Surface contents                                                                                                                                                    |         |
