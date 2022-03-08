---
id: fitbox
title: FitBox
sidebar_label: FitBox
slug: /shapes/fibox
---

The `FitBox` components allows you to automatically scale drawings so they fit into a destination rectangle.

| Name | Type     |  Description                                       |
|:-----|:---------|:---------------------------------------------------|
| src  | `SKRect` | Bounding rectangle of the drawing before scaling  |
| dst  | `SKRect` | Bounding rectangle of the drawing after scale      |
| fit? | `Fit`    | Method to make the image fit into the rectangle. Value can be `contain`, `fill`, `cover` `fitHeight`, `fitWidth`, `scaleDown`, `none` (default is `contain`) |

## Example

Consider the following SVG export.
Its bounding source rectangle is `0, 0, 664, 308`:

```xml
<svg width="664" height="308" viewBox="0 0 664 308" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 170.1 215.5 C 165 222.3..." fill="black"/>
</svg>
```

We would like to automatically scale that path to our canvas of size `256 x 256`:

```tsx twoslash
import {Canvas, FitBox, Path, rect} from "@shopify/react-native-skia";

const Hello = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <FitBox src={rect(0, 0, 664, 308)} dst={rect(0, 0, 256, 256)}>
        <Path path="M 170.1 215.5 C 165 222.3..." />
      </FitBox>
    </Canvas>
  );
}
```

### Result

![Hello Skia](assets/fitbox/hello.png)

