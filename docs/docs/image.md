---
id: image
title: Image
sidebar_label: Image
slug: /images
---

Images can be drawn by specifying the output rectangle and how the image should fit into that rectangle.

| Name   | Type      | Description                                                                                                                                                   |
| :----- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| image  | `SkImage` | Image instance.                                                                                                                                               |
| x      | `number`  | Left position of the destination image.                                                                                                                       |
| y      | `number`  | Right position of the destination image.                                                                                                                      |
| width  | `number`  | Width of the destination image.                                                                                                                               |
| height | `number`  | Height of the destination image.                                                                                                                              |
| fit?   | `Fit`     | Method to make the image fit into the rectangle. Value can be `contain`, `fill`, `cover` `fitHeight`, `fitWidth`, `scaleDown`, `none` (default is `contain`). |

### Image Loading

Images are loaded using the `useImage` hook. This hook returns an `SkImage` instance which can be passed to the `Image` component.

Images can be loaded using require statements, or by passing a network URL directly. It is also possible to load images from the app bundle using named images:

| Usage                                       | Description                                                                                |
| :------------------------------------------ | :----------------------------------------------------------------------------------------- |
| useImage(require("../../assets/oslo.jpg"))  | Loads an image that was included in the app javascript bundle along your javascript code.  |
| useImage("https://picsum.photos/200/300")   | Loads an image using a network request                                                     |
| useImage("Logo")                            | Loads an image that was added to the Android/iOS bundle                                    |

Loading an image is an asynchronous operation, so the `useImage` hook will return undefined until the image is loaded. You can use this to conditionally render the `Image` component like in the example below.

### Example

```tsx twoslash
import { Canvas, Image, useImage } from "@shopify/react-native-skia";

const ImageDemo = () => {
  // Alternatively, you can pass an image URL directly
  // for instance: const image = useImage("https://bit.ly/3fkulX5");
  const image = useImage(require("../../assets/oslo.jpg"));
  return (
    <Canvas style={{ flex: 1 }}>
      {image && (
        <Image
          image={image}
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

## Instance Methods

| Name           | Description                                                       |
| :------------- | :---------------------------------------------------------------- |
| height         | Returns the possibly scaled height of the image.                  |
| width          | Returns the possibly scaled width of the image.                   |
| encodeToBytes  | Encodes Image pixels, returning result as UInt8Array              |
| encodeToBase64 | Encodes Image pixels, returning result as a base64 encoded string |
