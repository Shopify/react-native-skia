---
id: atlas
title: Atlas
sidebar_label: Atlas
slug: /shapes/atlas
---

The Atlas component is used for efficient rendering of multiple instances of the same texture or image. It is especially useful for drawing a very large number of similar objects, like sprites, with varying transformations.

Its design particularly useful when using with [Reanimated](#animations).

| Name    | Type             |  Description     |
|:--------|:-----------------|:-----------------|
| image   | `SkImage or null` | Altas: image containing the sprites. |
| sprites | `SkRect[]` | locations of sprites in atlas.             |
| transforms | `RSXform[]` | Rotation/scale transforms to be applied for each sprite. |
| colors? | `SkColor[]` | Optional. Color to blend the sprites with. |
| blendMode? | `BlendMode` | Optional. Blend mode used to combine sprites and colors together. |

## RSXform

The RSXform object used by the altas API is the compression of the following matrix: `[fSCos -fSSin fTx, fSSin fSCos fTy, 0, 0, 1]`. Below are few transformations that you will find useful:

```tsx twoslash
import {Skia} from "@shopify/react-native-skia";

// 1. Identity (doesn't do anything)
let rsxForm = Skia.RSXform(1, 0, 0, 0);

// 2. Scale by 2 and translate by (50, 100)
rsxForm = Skia.RSXform(2, 0, 50, 100);

// 3. Rotate by PI/4, default pivot point is (0,0), translate by (50, 100)
const r = Math.PI/4;
rsxForm = Skia.RSXform(Math.cos(r), Math.sin(r), 50, 100);

// 4. Scale by 2, rotate by PI/4 with pivot point (25, 25)
rsxForm = Skia.RSXformFromRadians(2, r, 0, 0, 25, 25);

// 5. translate by (125, 0), rotate by PI/4 with pivot point (125, 25)
rsxForm = Skia.RSXformFromRadians(1, r, 100, 0, 125, 25);
```

## Hello World

In the example below, we draw in simple rectangle as an image.
Then we display that rectangle 150 times with a simple transformation applied to each rectangle.

```tsx twoslash
import {Skia, drawAsImage, Group, Rect, Canvas, Atlas, rect} from "@shopify/react-native-skia";

const size = { width: 25, height: 11.25 };
const strokeWidth = 2;
const imageSize = {
    width: size.width + strokeWidth,
    height: size.height + strokeWidth,
};
const image = drawAsImage(
    <Group>
    <Rect
        rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
        color="cyan"
    />
    <Rect
        rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
        color="blue"
        style="stroke"
        strokeWidth={strokeWidth}
    />
    </Group>,
    imageSize
);

export const Demo = () => {
  const numberOfBoxes = 150;
  const pos = { x: 128, y: 128 };
  const width = 256;
  const sprites = new Array(numberOfBoxes)
    .fill(0)
    .map(() => rect(0, 0, imageSize.width, imageSize.height));
  const transforms = new Array(numberOfBoxes).fill(0).map((_, i) => {
    const tx = 5 + ((i * size.width) % width);
    const ty = 25 + Math.floor(i / (width / size.width)) * size.width;
    const r = Math.atan2(pos.y - ty, pos.x - tx);
    return Skia.RSXform(Math.cos(r), Math.sin(r), tx, ty);
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Atlas image={image} sprites={sprites} transforms={transforms} />
    </Canvas>
  );
};
```

<img src={require("/static/img/atlas/hello-world.png").default} width="256" height="256" />


## Animations

The Atlas component should usually be used with Reanimated.
First, the [useTextureValue](/docs/animations/textures#usetexturevalue) hook will enable you to create a texture on the UI thread directly without needing to make any copies.
Secondly, we provide you with hooks such as [`useRectBuffer`](/docs/animations/hooks#userectbuffer) and [`useRSXformBuffer`](/docs/animations/hooks#usersxformbuffer) to efficiently animates on the sprites and transformations.

The example below is identical to the one above but the position is an animation value bound to a gesture.


```tsx twoslash
import {Skia, drawAsImage, Group, Rect, Canvas, Atlas, rect, useTextureValue, useRSXformBuffer} from "@shopify/react-native-skia";
import {useSharedValue, useDerivedValue} from "react-native-reanimated";
import {GestureDetector, Gesture} from "react-native-gesture-handler";

const size = { width: 25, height: 11.25 };
const strokeWidth = 2;
const textureSize = {
    width: size.width + strokeWidth,
    height: size.height + strokeWidth,
};

export const Demo = () => {
  const pos = useSharedValue({ x: 0, y: 0 });
  const texture = useTextureValue(
    <Group>
      <Rect
        rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
        color="cyan"
      />
      <Rect
        rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
        color="blue"
        style="stroke"
        strokeWidth={strokeWidth}
      />
    </Group>,
    textureSize
  );
  const gesture = Gesture.Pan().onChange((e) => (pos.value = e));
  const numberOfBoxes = 150;
  const width = 256;
  const sprites = new Array(numberOfBoxes)
    .fill(0)
    .map(() => rect(0, 0, textureSize.width, textureSize.height));

  const transforms = useRSXformBuffer(numberOfBoxes, (val, i) => {
    "worklet";
    const tx = 5 + ((i * size.width) % width);
    const ty = 25 + Math.floor(i / (width / size.width)) * size.width;
    const r = Math.atan2(pos.value.y - ty, pos.value.x - tx);
    val.set(Math.cos(r), Math.sin(r), tx, ty);
  });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Atlas image={texture} sprites={sprites} transforms={transforms} />
      </Canvas>
    </GestureDetector>
  );
};
```
