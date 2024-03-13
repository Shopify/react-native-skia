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
First, the [useTexture](/docs/animations/textures#usetexture) hook will enable you to create a texture on the UI thread directly without needing to make any copies.
Secondly, we provide you with hooks such as [`useRectBuffer`](/docs/animations/hooks#userectbuffer) and [`useRSXformBuffer`](/docs/animations/hooks#usersxformbuffer) to efficiently animates on the sprites and transformations.

The example below is identical to the one above but the position is an animation value bound to a gesture.


```tsx twoslash
import {Skia, drawAsImage, Group, Rect, Canvas, Atlas, rect, useTexture, useRSXformBuffer} from "@shopify/react-native-skia";
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
  const texture = useTexture(
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

## Multiple Unique Sprites

In the example below, we put multiple star shapes into the Atlas texture (one of each color). Then we initialize `sprites` and `transformations` to create a repeating grid pattern.

```tsx twoslash
import { Group, Canvas, Atlas, rect, useTexture, Path, Skia } from "@shopify/react-native-skia";

const starPath = "M 32 0 L 42 20 L 64 23.25 L 48 38.75 L 51.75 61 L 32 50.5 L 12.25 61 L 16 38.75 L 0 23.25 L 22 20 L 32 0 Z";
const colors = ["#EC5B88", "#B153E2", "#5d5cc6", "#43B1E5", "#97e672", "#ffa245"];
const starSize = 64;
const gridSize = 12;
const textureSize = { width: starSize * colors.length, height: starSize };
const scale = 0.25; // scale each sprite down to 25% of the original star size

const Star = ({ color }) => <Path path={starPath} color={color} />;

export const Demo = () => {
  const texture = useTexture(
    <Group>
      {colors.map((color, i) => (
        <Group key={color} transform={[{ translateX: i * starSize }]}>
          <Star color={color} />
        </Group>
      ))}
    </Group>,
    textureSize
  );

  const sprites = [];
  const transforms = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const colorIndex = (y + x) % colors.length;
      // get the location of the colorIndex star in the texture
      const sprite = rect(colorIndex * starSize, 0, starSize, starSize);
      // create a transform to position the sprite in the grid
      const xform = Skia.RSXform(scale, 0, x * (starSize * scale), y * (starSize * scale));
      sprites.push(sprite);
      transforms.push(xform);
    }
  }

  return (
    <Canvas style={{ flex: 1 }}>
      <Atlas image={texture} sprites={sprites} transforms={transforms} />
    </Canvas>
  );
};
```

<img src={require("/static/img/atlas/multiple-unique-sprites.png").default} width="256" height="256" />
