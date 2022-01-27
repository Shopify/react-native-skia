---
id: image
title: Image
sidebar_label: Image
slug: /images
---

Images can be draw by specifying the output rectangle and how the image should fit into that rectangle.

| Name   | Type                  | Description                                                                                                                                                   |
| :----- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| source | `require` or `string` | Source of the image or an HTTP(s) URL.                                                                                                                        |
| x      | `number`              | Left position of the destination image.                                                                                                                       |
| y      | `number`              | Right position of the destination image.                                                                                                                      |
| width  | `number`              | Width of the destination image.                                                                                                                               |
| height | `number`              | Height of the destination image.                                                                                                                              |
| fit?   | `Fit`                 | Method to make the image fit into the rectangle. Value can be `contain`, `fill`, `cover` `fitHeight`, `fitWidth`, `scaleDown`, `none` (default is `contain`). |

### Example

```tsx twoslash
import { Canvas, Image, useImage } from "@shopify/react-native-skia";

const ImageDemo = () => {
  // Alternatively, you can pass an image URL directly
  // for instance: const source = useImage("https://bit.ly/3fkulX5");
  const source = useImage(require("../../assets/oslo.jpg"));
  return (
    <Canvas style={{ flex: 1 }}>
      {source && (
        <Image
          source={source}
          fit="contain"
          x={0}
          y={0}
          width={256}
          height={256}
        />
      )}
    </Canvas>
  );
};
```

### fit="contain"

![fit="contain"](assets/images/contain.png)

### fit="cover"

![fit="cover"](assets/images/cover.png)

### fit="fill"

![fit="fill"](assets/images/fill.png)

### fit="fitHeight"

![fit="fitHeight"](assets/images/fitHeight.png)

### fit="fitWidth"

![fit="fitWidth"](assets/images/fitWidth.png)

### fit="scaleDown"

![fit="fitWidth"](assets/images/scaleDown.png)

### fit="none"

![fit="none"](assets/images/none.png)

## Image Instance Methods

| Name              | Description                                                                           |
| :---------------- | :------------------------------------------------------------------------------------ |
| height            | Returns the possibly scaled height of the image.                                      |
| width             | Returns the possibly scaled width of the image.                                       |
| makeShaderOptions | Returns this image as a shader with the specified tiling. It will use cubic sampling. |
| makeShaderCubic   | Returns this image as a shader with the specified tiling. It will use cubic sampling. |
| encodeToBytes     | Encodes Image pixels, returning result as UInt8Array                                  |
| encodeToBase64    | Encodes Image pixels, returning result as a base64 encoded string                     |

## Offscreen Drawing

To create an image without drawing directly to the screen, you can create a new Surface and use
its canvas to perform your drawing operations. You can use all the regular canvas methods when drawing to an offscreen surface.

Offscreen images are like regular images and can be drawn back to screen, saved, or its contents can be used for further processing.

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";

const surface = Skia.MakeSurface(256, 256);
const canvas = surface!.getCanvas();

// Perform drawing operations
canvas.drawColor(Skia.Color("#FF0000FF"));

// Get image
const image = surface!.makeImageSnapshot();

// Convert image to either Uint8Array of bytes:
const bytes = image.encodeToBytes();

// or a base64 encoded string:
const base64 = image.encodeToBase64();
```

Data that represents an image can also be used to create a new image using the method `MakeImageFromEncoded`. This method takes a `Data` object that can be initialized using
different sources like bytes, base64 or a Uri.

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";

// Base64 string reprsenting a 1x1 transparent png
const base64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAA" +
  "fFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";

const data = Skia.Data.fromBase64(base64);
const image = Skia.MakeImageFromEncoded(data);
```
