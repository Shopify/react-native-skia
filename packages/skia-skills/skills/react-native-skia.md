# React Native Skia Skill

You are an expert in React Native Skia, a high-performance 2D graphics library for React Native.

## Behavior Guidelines

1. **Performance focus**: Always consider render performance implications
2. **Platform awareness**: Ask about target platform (iOS/Android/Web) when relevant
3. **Prefer declarative**: Suggest the declarative JSX API over imperative drawing when possible
4. **Shader expertise**: Provide guidance on SkSL shader syntax and best practices
5. **Reanimated integration**: Consider animation requirements and Reanimated 3 patterns

## Documentation Reference

The following sections contain the complete API documentation.


---

## Overview

React Native Skia supports animated images. Supported formats are GIF and animated WebP.

## Using Reanimated

If you use Reanimated, we offer a `useAnimatedImageValue` hook that does everything automatically. `useAnimatedImageValue` returns a shared value that automatically updates on every frame.

In the example below, we display and animate a GIF using Reanimated. The shared value is first null, and once the image is loaded, it will update with an `SkImage` object on every frame.

```tsx twoslash
import React from "react";
import {
  Canvas,
  Image,
  useAnimatedImageValue,
} from "@shopify/react-native-skia";

export const AnimatedImages = () => {
  // This can be an animated GIF or WebP file
  const bird = useAnimatedImageValue(
    require("../../assets/birdFlying.gif")
  );
  return (
      <Canvas
        style={{
          width: 320,
          height: 180,
        }}
      >
        <Image
          image={bird}
          x={0}
          y={0}
          width={320}
          height={180}
          fit="contain"
        />
      </Canvas>
  );
};

```

![bird](assets/bird.gif)

There is a second optional parameter available to control the pausing of the animation via a shared value.

```tsx twoslash
import React from "react";
import {Pressable} from "react-native";
import {useSharedValue} from "react-native-reanimated";
import {
  Canvas,
  Image,
  useAnimatedImageValue,
} from "@shopify/react-native-skia";

export const AnimatedImages = () => {
  const isPaused = useSharedValue(false);
  // This can be an animated GIF or WebP file
  const bird = useAnimatedImageValue(
    require("../../assets/birdFlying.gif"),
    isPaused
  );
  return (
    <Pressable onPress={() => isPaused.value = !isPaused.value}>
      <Canvas
        style={{
          width: 320,
          height: 180,
        }}
      >
        <Image
          image={bird}
          x={0}
          y={0}
          width={320}
          height={180}
          fit="contain"
        />
      </Canvas>
    </Pressable>
  );
};

```

## Manual API

To load an image as a `SkAnimatedImage` object, we offer a `useAnimatedImage` hook:

```tsx twoslash
import {useAnimatedImage} from "@shopify/react-native-skia";

// bird is an SkAnimatedImage
const bird = useAnimatedImage(
  require("../../assets/birdFlying.gif")
)!;
// SkAnimatedImage offers 4 methods: decodeNextFrame(), getCurrentFrame(), currentFrameDuration(), and getFrameCount()
// getCurrentFrame() returns a regular SkImage
const image = bird.getCurrentFrame();
// decode the next frame
bird.decodeNextFrame();
// fetch the current frame number
const currentFrame = bird.currentFrameDuration();
// fetch the total number of frames
const frameCount = bird.getFrameCount();
console.log({ frameCount, currentFrame, image });
```


In Skia, backdrop filters are equivalent to their [CSS counterpart](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter). They allow you to apply image filters such as blurring to the area behind a [clipping mask](/docs/group#clipping-operations). A backdrop filter extends the [Group component](/docs/group#clipping-operations). All properties from the [group component](/docs/group) can be applied to a backdrop filter.

The [clipping mask](/docs/group#clipping-operations) will be used to restrict the area of the backdrop filter.

## Backdrop Filter

Applies an image filter to the area behind the canvas or behind a defined clipping mask. The first child of a backdrop filter is the image filter to use. All properties from the [group component](/docs/group) can be applied to a backdrop filter.

### Example

Apply a black and white color matrix to the clipping area:

```tsx twoslash
import {
  Canvas,
  BackdropFilter,
  Image,
  ColorMatrix,
  useImage,
} from "@shopify/react-native-skia";

// https://kazzkiq.github.io/svg-color-filter/
const BLACK_AND_WHITE = [
  0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
];

export const Filter = () => {
  const image = useImage(require("./assets/oslo.jpg"));

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Image image={image} x={0} y={0} width={256} height={256} fit="cover" />
      <BackdropFilter
        clip={{ x: 0, y: 128, width: 256, height: 128 }}
        filter={<ColorMatrix matrix={BLACK_AND_WHITE} />}
      />
    </Canvas>
  );
};
```

<img src={require("/static/img/black-and-white-backdrop-filter.png").default} width="256" height="256" />

## Backdrop Blur

Creates a backdrop blur. All properties from the [group component](/docs/group) can be applied to a backdrop filter.

| Name | Type     | Description |
| :--- | :------- | :---------- |
| blur | `number` | Blur radius |

## Example

```tsx twoslash
import {
  Canvas,
  Fill,
  Image,
  BackdropBlur,
  useImage,
} from "@shopify/react-native-skia";

export const Filter = () => {
  const image = useImage(require("./assets/oslo.jpg"));

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Image image={image} x={0} y={0} width={256} height={256} fit="cover" />
      <BackdropBlur blur={4} clip={{ x: 0, y: 128, width: 256, height: 128 }}>
        <Fill color="rgba(0, 0, 0, 0.2)" />
      </BackdropBlur>
    </Canvas>
  );
};
```

<img src={require("/static/img/blur-backdrop-filter.png").default} width="256" height="256" />


## Color Matrix

Creates a color filter using the provided color matrix.
A playground to build color matrices is available [here](https://fecolormatrix.com/).

| Name      | Type          | Description                                |
| :-------- | :------------ | :----------------------------------------- |
| matrix    | `number[]`    | Color Matrix (5x4)                         |
| children? | `ColorFilter` | Optional color filter to be applied first. |

```tsx twoslash
import {
  Canvas,
  ColorMatrix,
  Image,
  useImage,
} from "@shopify/react-native-skia";

const MatrixColorFilter = () => {
  const image = useImage(require("./assets/oslo.jpg"));

  return (
    <Canvas style={{ flex: 1 }}>
      <Image x={0} y={0} width={256} height={256} image={image} fit="cover">
        <ColorMatrix
          matrix={[
            -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015, 1.69,
            -0.703, 0, 0, 0, 0, 0, 1, 0,
          ]}
        />
      </Image>
    </Canvas>
  );
};
```

<img src={require("/static/img/color-filters/color-matrix.png").default} width="256" height="256" />

## BlendColor

Creates a color filter with the given color and blend mode.

| Name      | Type          | Description                                        |
| :-------- | :------------ | :------------------------------------------------- |
| color     | `Color`       | Color                                              |
| mode      | `BlendMode`   | see [blend modes](paint/properties.md#blendmode). |
| children? | `ColorFilter` | Optional color filter to be applied first.         |

```tsx twoslash
import { Canvas, BlendColor, Group, Circle } from "@shopify/react-native-skia";

const MatrixColorFilter = () => {
  const r = 128;
  return (
    <Canvas style={{ flex: 1 }}>
      <Group>
        <BlendColor color="cyan" mode="multiply" />
        <Circle cx={r} cy={r} r={r} color="yellow" />
        <Circle cx={2 * r} cy={r} r={r} color="magenta" />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/color-filters/color-blend.png").default} width="256" height="256" />

## Lerp

Creates a color filter that is linearly interpolated between two other color filters.

| Name     | Type          | Description                          |
| :------- | :------------ | :----------------------------------- |
| t        | `number`      | Value between 0 and 1.               |
| children | `ColorFilter` | The two filters to interpolate from. |

```tsx twoslash
import {
  Canvas,
  ColorMatrix,
  Image,
  useImage,
  Lerp,
} from "@shopify/react-native-skia";

const MatrixColorFilter = () => {
  const image = useImage(require("./assets/oslo.jpg"));

  const blackAndWhite = [
    0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0,
  ];
  const purple = [
    1, -0.2, 0, 0, 0, 0, 1, 0, -0.1, 0, 0, 1.2, 1, 0.1, 0, 0, 0, 1.7, 1, 0,
  ];
  return (
    <Canvas style={{ flex: 1 }}>
      <Image x={0} y={0} width={256} height={256} image={image} fit="cover">
        <Lerp t={0.5}>
          <ColorMatrix matrix={purple} />
          <ColorMatrix matrix={blackAndWhite} />
        </Lerp>
      </Image>
    </Canvas>
  );
};
```

## LinearToSRGBGamma

Creates a color filter that converts between linear colors and sRGB colors.

| Name      | Type          | Description                                |
| :-------- | :------------ | :----------------------------------------- |
| children? | `ColorFilter` | Optional color filter to be applied first. |

```tsx twoslash
import {
  Canvas,
  BlendColor,
  Group,
  Circle,
  LinearToSRGBGamma,
} from "@shopify/react-native-skia";

const MatrixColorFilter = () => {
  const r = 128;
  return (
    <Canvas style={{ flex: 1 }}>
      <Group>
        <LinearToSRGBGamma>
          <BlendColor color="lightblue" mode="srcIn" />
        </LinearToSRGBGamma>
        <Circle cx={r} cy={r} r={r} />
      </Group>
    </Canvas>
  );
};
```

## SRGBToLinearGamma

Creates a color filter that converts between sRGB colors and linear colors.

| Name      | Type          | Description                                |
| :-------- | :------------ | :----------------------------------------- |
| children? | `ColorFilter` | Optional color filter to be applied first. |

```tsx twoslash
import {
  Canvas,
  BlendColor,
  Group,
  Circle,
  SRGBToLinearGamma,
} from "@shopify/react-native-skia";

const MatrixColorFilter = () => {
  const r = 128;
  return (
    <Canvas style={{ flex: 1 }}>
      <Group>
        <SRGBToLinearGamma>
          <BlendColor color="lightblue" mode="srcIn" />
        </SRGBToLinearGamma>
        <Circle cx={r} cy={r} r={r} />
      </Group>
    </Canvas>
  );
};
```


The Group component is an essential construct in React Native Skia.
Group components can be deeply nested with one another.
It can apply the following operations to its children:

- [Paint properties](#paint-properties)
- [Transformations](#transformations)
- [Clipping operations](#clipping-operations)
- [Layer Effects](#layer-effects)

| Name        | Type                | Description                                                                                                                                                                                                           |
| :---------- | :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| transform?  | `Transform2d` | [Same API that's in React Native](https://reactnative.dev/docs/transforms) except for two differences: the default origin of the transformation is at the top-left corner (React Native views use the center), and all rotations are in radians. |
| origin?     | `Point`             | Sets the origin of the transformation. This property is not inherited by its children.                                                                                                                                |
| clip?       | `RectOrRRectOrPath` | Rectangle, rounded rectangle, or Path to use to clip the children.                                                                                                                                                    |
| invertClip? | `boolean`           | Invert the clipping region: parts outside the clipping region will be shown and, inside will be hidden.                                                                                                               |
| layer?      | `RefObject<Paint>`  | Draws the children as a bitmap and applies the effects provided by the paint.                                                                                                                                         |
| zIndex?      | `number`  | Overrides the drawing order of the children. A child with a higher zIndex will be drawn on top of a child with a lower zIndex. The zIndex is local to the group. The default zIndex is 0. Negative values are supported. |

The following three components are not being affected by the group properties. To apply paint effects on these component, you need to use [layer effects](#layer-effects).
In each component reference, we also document how to apply paint effects on them.
* [Picture](/docs/shapes/pictures#applying-effects)
* [SVG](/docs/images-svg#applying-effects)
* [Paragraph](/docs/text/paragraph#applying-effects)

## Paint Properties

Its children will inherit all paint attributes applied to a group. These attributes can be properties like `color` or `style` or children like `<Shader />`, or `<ImageFilter />` for instance ([see painting](/docs/paint/overview)).

```tsx twoslash
import { Canvas, Circle, Group } from "@shopify/react-native-skia";

export const PaintDemo = () => {
  const r = 128;
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={r} cy={r} r={r} color="#51AFED" />
      {/* The paint is inherited by the following sibling and descendants. */}
      <Group color="lightblue" style="stroke" strokeWidth={10}>
        <Circle cx={r} cy={r} r={r / 2} />
        <Circle cx={r} cy={r} r={r / 3} color="white" />
      </Group>
    </Canvas>
  );
};
```

![Paint Assignment](assets/group/paint-assignment.png)

## Transformations

The transform property is identical to its [homonymous property in React Native](https://reactnative.dev/docs/transforms) except for one significant difference: in React Native, the origin of transformation is the center of the object, whereas it is the top-left position of the object in Skia.

The origin property is a helper to set the origin of the transformation. This property is not inherited by its children.
All rotations are in radians.

### Simple Transformation

```tsx twoslash
import { Canvas, Fill, Group, RoundedRect } from "@shopify/react-native-skia";

const SimpleTransform = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#e8f4f8" />
      <Group color="lightblue" transform={[{ skewX: Math.PI / 6 }]}>
        <RoundedRect x={64} y={64} width={128} height={128} r={10} />
      </Group>
    </Canvas>
  );
};
```

![Simple Transformation](assets/group/simple-transform.png)

### Transformation of Origin

```tsx twoslash
import { Canvas, Fill, Group, RoundedRect } from "@shopify/react-native-skia";

const SimpleTransform = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#e8f4f8" />
      <Group
        color="lightblue"
        origin={{ x: 128, y: 128 }}
        transform={[{ skewX: Math.PI / 6 }]}
      >
        <RoundedRect x={64} y={64} width={128} height={128} r={10} />
      </Group>
    </Canvas>
  );
};
```

![Origin Transformation](assets/group/origin-transform.png)

## Clipping Operations

`clip` provides a clipping region that sets what part of the children should be shown.
Parts inside the region are shown, while those outside are hidden.
When using `invertClip`, everything outside the clipping region will be shown, and parts inside the clipping region will be hidden.

### Clip Rectangle

```tsx twoslash
import {
  Canvas,
  Group,
  Image,
  useImage,
  rect,
  Fill,
} from "@shopify/react-native-skia";

const size = 256;
const padding = 32;

const Clip = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  const rct = rect(padding, padding, size - padding * 2, size - padding * 2);

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="lightblue" />
      <Group clip={rct}>
        <Image
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="cover"
        />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/group/clip-rect.png").default} width="256" height="256" />

### Clip Rounded Rectangle

```tsx twoslash
import {
  Canvas,
  Group,
  Image,
  useImage,
  rrect,
  rect,
} from "@shopify/react-native-skia";

const size = 256;
const padding = 32;
const r = 8;

const Clip = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  const roundedRect = rrect(
    rect(padding, padding, size - padding * 2, size - padding * 2),
    r,
    r
  );

  return (
    <Canvas style={{ flex: 1 }}>
      <Group clip={roundedRect}>
        <Image
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="cover"
        />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/group/clip-rrect.png").default} width="256" height="256" />

### Clip Path

```tsx twoslash
import {
  Canvas,
  Group,
  Image,
  useImage,
  Skia,
} from "@shopify/react-native-skia";

const Clip = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  const star = Skia.Path.MakeFromSVGString(
    "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
  )!;

  return (
    <Canvas style={{ flex: 1 }}>
      <Group clip={star}>
        <Image image={image} x={0} y={0} width={256} height={256} fit="cover" />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/group/clip-path.png").default} width="256" height="256" />

### Invert Clip

```tsx twoslash
import {
  Canvas,
  Group,
  Image,
  useImage,
  Skia,
} from "@shopify/react-native-skia";

const Clip = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  const star = Skia.Path.MakeFromSVGString(
    "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
  )!;

  return (
    <Canvas style={{ flex: 1 }}>
      <Group clip={star} invertClip>
        <Image image={image} x={0} y={0} width={256} height={256} fit="cover" />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/group/invert-clip.png").default} width="256" height="256" />

## Layer Effects

Using the `layer` property will create a bitmap drawing of the children.
You can use it to apply effects.
This is particularly useful to build effects that need to be applied to a group of elements and not one in particular.

```tsx twoslash
import {
  Canvas,
  Group,
  Circle,
  Blur,
  Paint,
  ColorMatrix,
} from "@shopify/react-native-skia";

const Clip = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Group
        color="lightblue"
        layer={
          <Paint>
            <Blur blur={20} />
            <ColorMatrix
              matrix={[
                1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 18, -7,
              ]}
            />
          </Paint>
        }
      >
        <Circle cx={0} cy={128} r={128 * 0.95} />
        <Circle cx={256} cy={128} r={128 * 0.95} />
      </Group>
    </Canvas>
  );
};
```

<img alt="Rasterize" src={require("/static/img/group/rasterize.png").default} width="256" height="256" />

## Drawing Order (zIndex)

The `zIndex` property allows you to control the drawing order of elements. It can be applied to a group or a drawing command. An element with a higher `zIndex` will be drawn on top of a sibling element with a lower `zIndex`. The default `zIndex` is 0, and negative values are supported.

The `zIndex` is scoped to the parent [`<Group />`](/docs/group). This means that the `zIndex` of an element only affects its drawing order relative to its siblings within the same group. A group's `zIndex` will determine its order among its sibling groups.

### Example

In the example below, the cyan circle (`zIndex={2}`) is drawn on top, followed by the magenta circle (`zIndex={1}`), and finally the yellow circle (`zIndex={0}`).

```tsx twoslash
import { Canvas, Circle, Group, BlurMask } from "@shopify/react-native-skia";

export const ZIndexDemo = () => {
  const r = 80;
  const width = 256;
  const height = 256;
  return (
    <Canvas style={{ width, height }}>
      <Group>
        <BlurMask style="solid" blur={10} />
        <Circle cx={r} cy={r} r={r} color="cyan" zIndex={2} />
        <Circle cx={width - r} cy={r} r={r} color="magenta" zIndex={1} />
        <Circle
          cx={width / 2}
          cy={height - r}
          r={r}
          color="yellow"
          zIndex={0}
        />
      </Group>
    </Canvas>
  );
};
```


## Fitbox

The `FitBox` component is based on the `Group` component and allows you to scale drawings to fit into a destination rectangle automatically.

| Name | Type     | Description                                                                                                                                                  |
| :--- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src  | `SKRect` | Bounding rectangle of the drawing before scaling                                                                                                             |
| dst  | `SKRect` | Bounding rectangle of the drawing after scale                                                                                                                |
| fit? | `Fit`    | Method to make the image fit into the rectangle. Value can be `contain`, `fill`, `cover` `fitHeight`, `fitWidth`, `scaleDown`, `none` (default is `contain`) |

### Example

Consider the following SVG export.
Its bounding source rectangle is `0, 0, 664, 308`:

```xml
<svg width="664" height="308" viewBox="0 0 664 308" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 170.1 215.5 C 165 222.3..." fill="black"/>
</svg>
```

We would like to automatically scale that path to our canvas of size `256 x 256`:

```tsx twoslash
import { Canvas, FitBox, Path, rect } from "@shopify/react-native-skia";

const Hello = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <FitBox src={rect(0, 0, 664, 308)} dst={rect(0, 0, 256, 256)}>
        <Path
          path="M 170.1 215.5 C 165 222.3..."
          strokeCap="round"
          strokeJoin="round"
          style="stroke"
          strokeWidth={30}
        />
      </FitBox>
    </Canvas>
  );
};
```

<img src={require("/static/img/group/scale-path.png").default} width="256" height="256" />

Draw an SVG (see [SVG Support](#svg-support)).

If the root dimensions are in absolute units, the width/height properties have no effect since the initial viewport is fixed.

| Name      | Type      |  Description                                                  |
|:----------|:----------|:--------------------------------------------------------------|
| svg       | `SVG` | SVG Image. |
| width?    | `number`  | Width of the destination image. This is used to resolve the initial viewport when the root SVG width is specified in relative units. |
| height?   | `number`  | Height of the destination image. This is used to resolve the initial viewport when the root SVG height is specified in relative units.                              |
| x?    | `number`  | Optional displayed x coordinate of the svg container.  |
| y?   | `number`  | Optional displayed y coordinate of the svg container.                            |

:::info

The `ImageSVG` component doesn't follow the same painting rules as other components.
[see applying effects](#applying-effects).

On Web, the Current Transformation Matrix (CTM) won't be applied to `ImageSVG` because the component relies on browser SVG rendering instead of CanvasKit. The SVG is rendered as a hidden image element and then imported as image data. This means transformations need to be prepared beforehand or applied through the `Group` component with explicit transform matrices.

:::

### Example

```tsx twoslash
import {
  Canvas,
  ImageSVG,
  useSVG
} from "@shopify/react-native-skia";

const ImageSVGDemo = () => {
  // Alternatively, you can pass an SVG URL directly
  // for instance: const svg = useSVG("https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg");
  const svg = useSVG(require("../../assets/tiger.svg"));
  return (
    <Canvas style={{ flex: 1 }}>
      { svg && (
        <ImageSVG
          svg={svg}
          width={256}
          height={256}
        />)
      }
    </Canvas>
  );
};
```

You can also use an inlined string as SVG (using `Skia.SVG.MakeFromString`):

```tsx twoslash
import React from "react";
import { Canvas, ImageSVG, Skia } from "@shopify/react-native-skia";

const svg = Skia.SVG.MakeFromString(
  `<svg viewBox='0 0 290 500' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='31' cy='325' r='120px' fill='#c02aaa'/>
  </svg>`
)!;

export const SVG = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <ImageSVG
        svg={svg}
        x={0}
        y={0}
        width={290}
        height={500}
      />
    </Canvas>
  );
};
```

### Text

Both `Skia.SVG.MakeFromData` and `Skia.SVG.MakeFromString` accept an optional second parameter to provide custom font management for text rendering in SVGs.
This works similarly to the [Paragraph API](/docs/text/paragraph) where you can use the `useFonts` hook to load custom fonts:

```tsx twoslash
import React from "react";
import { Canvas, ImageSVG, Skia, useFonts } from "@shopify/react-native-skia";

const SVGWithCustomFonts = () => {
  const fontMgr = useFonts({
    Roboto: [
      require("path/to/Roboto-Regular.ttf"),
      require("path/to/Roboto-Bold.ttf")
    ]
  });

  if (!fontMgr) {
    return null;
  }

  const svg = Skia.SVG.MakeFromString(
    `<svg viewBox='0 0 290 500' xmlns='http://www.w3.org/2000/svg'>
      <text x='10' y='50' font-family='Roboto' font-size='24'>Custom Font</text>
    </svg>`,
    fontMgr
  )!;

  return (
    <Canvas style={{ flex: 1 }}>
      <ImageSVG
        svg={svg}
        x={0}
        y={0}
        width={290}
        height={500}
      />
    </Canvas>
  );
};
```

:::info

On Web, both the `fontMgr` parameter (second parameter) and image resources (third parameter) are ignored as SVG rendering relies on the browser's native SVG renderer rather than Skia's SVG module.

:::

### Images

Both `Skia.SVG.MakeFromData` and `Skia.SVG.MakeFromString` accept an optional third parameter to provide image resources for `<image>` elements in SVGs.
This works similarly to [image loading in Skottie](/docs/skottie#with-assets).
You can reference images either through base64 data URIs or by providing a resource map:

```tsx twoslash
import React from "react";
import { Canvas, ImageSVG, Skia, useData } from "@shopify/react-native-skia";

const SVGWithImages = () => {
  // Load an image asset
  const logo = useData(require("path/to/image.png"));

  if (!logo) {
    return null;
  }

  // Option 1: Using base64 data URI (embedded)
  const svgWithEmbeddedImage = Skia.SVG.MakeFromString(
    `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <image xlink:href="data:image/png;base64,iVBORw0KG..." height="200" width="200" />
    </svg>`
  );

  // Option 2: Using external reference with resource map
  const svgWithExternalImage = Skia.SVG.MakeFromString(
    `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <image xlink:href="logo.png" height="200" width="200" />
    </svg>`,
    null,
    { "logo.png": logo }
  );

  return (
    <Canvas style={{ flex: 1 }}>
      <ImageSVG svg={svgWithExternalImage} x={0} y={0} width={200} height={200} />
    </Canvas>
  );
};
```

When rendering your SVG with Skia, all fonts available in your app are also available to your SVG.
However, the way you can set the `font-family` attribute is as flexible as on the web.
```jsx
// ✅ This is really all that is supported:
<text font-family="MyFont" />
// ❌ This won't work. If MyFont is available, this syntax will be accepted.
// but it will never fallback to monospace
<text font-family="MyFont, monospace" />
// ❌ The single quote syntax won't work either.
<text font-family="'MyFont'" />
```

## Scaling the SVG

As mentioned above, if the root dimensions are in absolute units, the width/height properties have no effect since the initial viewport is fixed. However you can access these values and use the fitbox function.

### Example

In the example below we scale the SVG to the canvas width and height.

```tsx twoslash
import React from "react";
import { Canvas, ImageSVG, Skia, rect, fitbox, Group } from "@shopify/react-native-skia";

const svg = Skia.SVG.MakeFromString(
  `<svg viewBox='0 0 20 20' width="20" height="20" xmlns='http://www.w3.org/2000/svg'>
    <circle cx='10' cy='10' r='10' fill='#00ffff'/>
  </svg>`
)!;

const width = 256;
const height = 256;
const src = rect(0, 0, svg.width(), svg.height());
const dst = rect(0, 0, width, height);

export const SVG = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={fitbox("contain", src, dst)}>
        <ImageSVG svg={svg} x={0} y={0} width={20} height={20} />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/svg.png").default} width="256" height="256" />

## Applying Effects

The `ImageSVG` component doesn't follow the same painting rules as other components.
This is because behind the scene, we use the SVG module from Skia.
However you can apply effets using the `layer` property.

### Opacity Example

In the example below we apply an opacity effect via the `ColorMatrix` component.

```tsx twoslash
import React from "react";
import { Canvas, ImageSVG, Skia, rect, fitbox, useSVG, Group, Paint, OpacityMatrix, ColorMatrix } from "@shopify/react-native-skia";

const width = 256;
const height = 256;

export const SVG = () => {
  const tiger = useSVG(require("./tiger.svg"));
  if (!tiger) {
    return null;
  }
  const src = rect(0, 0, tiger.width(), tiger.height());
  const dst = rect(0, 0, width, height);
  return (
    <Canvas style={{ flex: 1 }}>
      <Group
        transform={fitbox("contain", src, dst)}
        layer={<Paint><ColorMatrix matrix={OpacityMatrix(0.5)} /></Paint>}
      >
        <ImageSVG svg={tiger} x={0} y={0} width={800} height={800} />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/opacity-tiger.png").default} width="256" height="256" />

### Blur Example

In the example below we apply a blur image filter to the SVG.

```tsx twoslash
import React from "react";
import { Canvas, ImageSVG, Skia, rect, fitbox, useSVG, Group, Paint, Blur } from "@shopify/react-native-skia";

const width = 256;
const height = 256;

export const SVG = () => {
  const tiger = useSVG(require("./tiger.svg"));
  if (!tiger) {
    return null;
  }
  const src = rect(0, 0, tiger.width(), tiger.height());
  const dst = rect(0, 0, width, height);
  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={fitbox("contain", src, dst)} layer={<Paint><Blur blur={10} /></Paint>}>
        <ImageSVG svg={tiger} x={0} y={0} width={800} height={800} />
      </Group>
    </Canvas>
  );
};
```

### Result

<img src={require("/static/img/blurred-tiger.png").default} width="256" height="256" />

## SVG Support

The [SVG module from Skia](https://github.com/google/skia/tree/main/modules/svg) displays SVGs as images.
We expect most SVG files to render correctly out of the box, especially if they come from Figma or Illustrator.
However, please be aware of some of the quirks below when using it.
Text elements currently won't render and any external XML elements such as XLink or CSS won't render.
If your SVG doesn't render correctly and you've considered all the items below, please file [an issue](https://github.com/Shopify/react-native-skia/issues/new).

### CSS Styles

CSS styles included in SVG are not supported.
A tool like SVGO can help with converting CSS style attributes to SVG attributes if possible. 
You can use it online [here](https://jakearchibald.github.io/svgomg/).
For instance, it can normalize CSS style attributes that contain transformations to the proper `transform` property.

### RGBA Colors

The RGBA color syntax is not supported. Instead, it would help if you used the `fill-opacity` and `stroke-opacity` attributes. Consider the example below.

```xml
<circle
  r="10"
  cx="10"
  cy="10"
  fill="rgba(100, 200, 300, 0.5)"
  stroke="rgba(100, 200, 300, 0.8)"
/>
```

Would need to be rewritten as:

```xml
<circle
  r="10"
  cx="10"
  cy="10"
  fill="rgb(100, 200, 300)"
  fill-opacity="0.5"
  stroke="rgb(100, 200, 300)"
  stroke-opacity="0.8"
/>
```

The `opacity` attribute also applies to both the `fill` and `stroke` attributes.

### Non Supported Elements

Below is the list of non-supported element.
  * `<animate>`
  * `<feComponentTransfer>`
  * `<feConvolveMatrix>`
  * `<feTile>`
  * `<feDropShadow>` 
  * `<foreignObject>`
  * `<script>`
  * `<view>`

### Inlined SVGs

Some SVGs contain inlined SVGs via the `<image>` or `<feImage>` elements. This is not supported.

### Gradient Templates

The deprecated `xlink:href` attribute is not supported in gradients.
You can use the `href` attribute instead.
However, we found that it doesn't appear to be adequately supported.
We would recommend avoiding using it.

### Fallbacks

Some SVGs with issues display nicely in the browser because they are very tolerant of errors. We found that the Skia SVG module is much less forgiving.


## Loading Images

### useImage

Images are loaded using the `useImage` hook. This hook returns an `SkImage` instance, which can be passed to the `Image` component.

Images can be loaded using require statements or by passing a network URL directly. It is also possible to load images from the app bundle using named images.

```tsx twoslash
import { useImage } from "@shopify/react-native-skia";
// Loads an image from the JavaScript bundle
const image1 = useImage(require("./assets/oslo"));
// Loads an image from the network
const image2 = useImage("https://picsum.photos/200/300");
// Loads an image that was added to the Android/iOS bundle
const image3 = useImage("Logo");
```

Loading an image is an asynchronous operation, so the `useImage` hook will return null until the image is fully loaded. You can use this behavior to conditionally render the `Image` component, as shown in the [example below](#example).

The hook also provides an optional error handler as a second parameter.

### MakeImageFromEncoded

You can also create image instances manually using `MakeImageFromEncoded`.

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";

// A sample base64-encoded pixel
const data = Skia.Data.fromBase64("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==");
const image = Skia.Image.MakeImageFromEncoded(data);
```

### MakeImage

`MakeImage` allows you to create an image by providing pixel data and specifying the format.

```tsx twoslash
import { Skia, AlphaType, ColorType } from "@shopify/react-native-skia";

const pixels = new Uint8Array(256 * 256 * 4);
pixels.fill(255);
let i = 0;
for (let x = 0; x < 256; x++) {
  for (let y = 0; y < 256; y++) {
    pixels[i++] = (x * y) % 255;
  }
}
const data = Skia.Data.fromBytes(pixels);
const img = Skia.Image.MakeImage(
  {
    width: 256,
    height: 256,
    alphaType: AlphaType.Opaque,
    colorType: ColorType.RGBA_8888,
  },
  data,
  256 * 4
);
```

**Note**: The nested for-loops in the code sample above seem to have a mistake in the loop conditions. They should loop up to `256`, not `256 * 4`, as the pixel data array has been initialized with `256 * 256 * 4` elements representing a 256 by 256 image where each pixel is represented by 4 bytes (RGBA).

### useImage

`useImage` is simply a helper function to load image data. 

## Image Component

Images can be drawn by specifying the output rectangle and how the image should fit into that rectangle.

| Name   | Type      | Description                                                                                                                                                   |
| :----- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| image  | `SkImage` | An instance of the image.                                                                                                                                               |
| x      | `number`  | The left position of the destination image.                                                                                                                       |
| y      | `number`  | The top position of the destination image.                                                                                                                      |
| width  | `number`  | The width of the destination image.                                                                                                                               |
| height | `number`  | The height of the destination image.                                                                                                                              |
| fit?   | `Fit`     | The method used to fit the image into the rectangle. Values can be `contain`, `fill`, `cover`, `fitHeight`, `fitWidth`, `scaleDown`, or `none` (the default is `contain`). |
| sampling? | `Sampling` | The method used to sample the image. see ([sampling options](/docs/images#sampling-options)). |

### Example

```tsx twoslash
import { Canvas, Image, useImage } from "@shopify/react-native-skia";

const ImageDemo = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={image} fit="contain" x={0} y={0} width={256} height={256} />
    </Canvas>
  );
};
```

### Sampling Options

The `sampling` prop allows you to control how the image is sampled when it is drawn.
Use cubic sampling for best quality: you can use the default `sampling={CubicSampling}` (defaults to `{ B: 0, C: 0 }`) or any value you would like: `sampling={{ B: 0, C: 0.5 }}`.

You can also use filter modes (`nearest` or `linear`) and mimap modes (`none`, `nearest`, or `linear`). Default is `nearest`.

```tsx twoslash
import { Canvas, Image, useImage, CubicSampling, FilterMode, MipmapMode } from "@shopify/react-native-skia";

const ImageDemo = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  return (
    <Canvas style={{ flex: 1 }}>
      <Image
        image={image}
        fit="contain"
        x={0}
        y={0}
        width={256}
        height={256}
        sampling={CubicSampling}
      />
      <Image
        image={image}
        fit="contain"
        x={0}
        y={0}
        width={256}
        height={256}
        sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.Nearest }}
      />
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

![fit="scaleDown"](assets/images/scaleDown.png)

### fit="none"

![fit="none"](assets/images/none.png)

## Instance Methods

| Name            | Description                                                           |
| :-------------- | :-------------------------------------------------------------------- |
| `height`        | Returns the possibly scaled height of the image.                      |
| `width`         | Returns the possibly scaled width of the image.                       |
| `getImageInfo`  | Returns the image info for the image.                                 |
| `encodeToBytes` | Encodes the image pixels, returning the result as a `UInt8Array`.     |
| `encodeToBase64`| Encodes the image pixels, returning the result as a base64-encoded string. |
| `readPixels`    | Reads the image pixels, returning result as UInt8Array or Float32Array |


Mask filters are effects that manipulate the geometry and alpha channel of graphical objects. 

## BlurMask

Creates a blur mask filter.

| Name        | Type        |  Description                                          |
|:------------|:------------|:------------------------------------------------------|
| blur        | `number`    | Standard deviation of the Gaussian blur. Must be > 0. |
| style?      | `BlurStyle` | Can be `normal`, `solid`, `outer`, or `inner` (default is `normal`).        |
| respectCTM? | `boolean`   | if true the blur's sigma is modified by the CTM (default is `false`).      |

### Example

```tsx twoslash
import {Canvas, Fill, Circle, BlurMask, vec} from "@shopify/react-native-skia";

const MaskFilterDemo = () => {
  return (
    <Canvas style={{ flex: 1}}>
      <Circle c={vec(128)} r={128} color="lightblue">
        <BlurMask blur={20} style="normal" />
      </Circle>
    </Canvas>
  );
};
```

| Style  |  Result                           |       |                                  |
|:-------|:----------------------------------|:----- |:---------------------------------|
| normal | ![Normal](assets/mask-filters/blur-normal.png) | inner | ![Inner](assets/mask-filters/blur-inner.png)  |
| solid  | ![Solid](assets/mask-filters/blur-solid.png)   | outer | ![Outer](assets/mask-filters/blur-outer.png)  |



The `Mask` component hides an element by masking the content at specific points.
Just like its [CSS counterpart](https://developer.mozilla.org/en-US/docs/Web/CSS/mask), there are two modes available:
* `alpha`: This mode indicates that the mask layer image's transparency (alpha channel) values should be used as the mask values. This is how masks work in Figma.
* `luminance`: This mode indicates that the luminance values of the mask layer image should be used as the mask values. This is how masks work in SVG.

The first child of `Mask` is the drawing used as a mask, and the remaining children are the drawings to mask.

By default, the mask is not clipped. If you want to clip the mask with the bounds of the contents, use the `clip` property. 

| Name      | Type                      | Description                                                   |
|:----------|:--------------------------|:--------------------------------------------------------------|
| mode?     | `alpha` or `luminance`    | Is it a luminance or alpha mask (default is `alpha`)          |
| clip?     | `boolean`                 | clip the mask so it doesn't exceed the content                |
| mask      | `ReactNode[] | ReactNode` | Mask definition                                               | 
| children  | `ReactNode[] | ReactNode` | Content to mask                                               |

## Alpha Mask

Opaque pixels will be visible and transparent pixels invisible.

```tsx twoslash
import {Canvas, Mask, Group, Circle, Rect} from "@shopify/react-native-skia";

const Demo = () => (
  <Canvas style={{ width: 256, height: 256 }}>
    <Mask
      mask={
        <Group>
          <Circle cx={128} cy={128} r={128} opacity={0.5} />
          <Circle cx={128} cy={128} r={64} />
        </Group>
      }
    >
      <Rect x={0} y={0} width={256} height={256} color="lightblue" />
    </Mask>
  </Canvas>
);
```

### Result

<img src={require("/static/img/mask/alpha-mask.png").default} width="256" height="256" />

## Luminance Mask

White pixels will be visible and black pixels invisible.

```tsx twoslash
import {Canvas, Mask, Group, Circle, Rect} from "@shopify/react-native-skia";

const Demo = () => (
  <Canvas style={{ width: 256, height: 256 }}>
    <Mask
      mode="luminance"
      mask={
        <Group>
          <Circle cx={128} cy={128} r={128} color="white" />
          <Circle cx={128} cy={128} r={64} color="black" />
        </Group>
      }
    >
      <Rect x={0} y={0} width={256} height={256} color="lightblue" />
    </Mask>
  </Canvas>
);
```

### Result

<img src={require("/static/img/mask/luminance-mask.png").default} width="256" height="256" />


## Discrete Path Effect

Creates an effect that breaks a path into segments of a certain length and randomly moves the endpoints away from the original path by a maximum deviation.

| Name      | Type         |  Description                                                  |
|:----------|:-------------|:--------------------------------------------------------------|
| length    | `number`     | length of the subsegments.                                    |
| deviation | `number`     | limit of the movement of the endpoints.                       |
| seed      | `number`     | modifies the randomness. See SkDiscretePathEffect.h for more. |
| children? | `PathEffect` | Optional path effect to apply.                                |


### Example

```tsx twoslash
import {Canvas, DiscretePathEffect, Path} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Discrete = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path path={logo} color="#61DAFB">
        <DiscretePathEffect length={10} deviation={2} />
      </Path>
    </Canvas>
  );
};
```

### Result

![Discrete Path Effect](assets/path-effects/discrete.png)

## Dash Path Effect

Creates an effect that adds dashes to the path.


| Name      | Type         |  Description                                                  |
|:----------|:-------------|:--------------------------------------------------------------|
| intervals | `number[]`   | even number of entries with even indices specifying the length of the "on" intervals, and the odd index specifying the length of "off". |
| phase     | `number`     | offset into the intervals array. Defaults to 0.        |
| children? | `PathEffect` | Optional path effect to apply.                                |

### Example

```tsx twoslash
import {Canvas, DashPathEffect, Path} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Discrete = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path path={logo} color="#61DAFB" style="stroke" strokeWidth={4}>
        <DashPathEffect intervals={[4, 4]} />
      </Path>
    </Canvas>
  );
};
```

### Result

![Dash Path Effect](assets/path-effects/dash.png)

## Corner Path Effect

Creates a path effect that can turn sharp corners into rounded corners.

| Name      | Type         |  Description                                                  |
|:----------|:-------------|:--------------------------------------------------------------|
| r         | `number`     | Radius.                                                       |
| children? | `PathEffect` | Optional path effect to apply.                                |

### Example

```tsx twoslash
import {Canvas, CornerPathEffect, Rect} from "@shopify/react-native-skia";


const Discrete = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect
        x={64}
        y={16}
        width={128}
        height={256 - 16}
        color="#61DAFB"
      >
        <CornerPathEffect r={64} />
      </Rect>
    </Canvas>
  );
};
```

### Result

![Corner Path Effect](assets/path-effects/corner.png)

## Path 1D Path Effect

Dash by replicating the specified path.

| Name      | Type                |  Description                                                                    |
|:----------|:--------------------|:--------------------------------------------------------------------------------|
| path      | `PathDef`           | The path to replicate (dash)                                                    |
| advance   | `number`            |  The space between instances of path                                            |
| phase     | `number`            | distance (mod advance) along the path for its initial position                      |
| style     | `Path1DEffectStyle` | how to transform path at each point (based on the current position and tangent) |
| children? | `PathEffect`        | Optional path effect to apply.                                                  |

### Example

```tsx twoslash
import {Canvas, Path1DPathEffect, Path} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Path1D = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path path={logo} color="#61DAFB" style="stroke" strokeWidth={15}>
        <Path1DPathEffect
          path="M -10 0 L 0 -10, 10 0, 0 10 Z"
          advance={20}
          phase={0}
          style="rotate"
        />
      </Path>
    </Canvas> 
  );
};
```

### Result

![Corner Path Effect](assets/path-effects/path1d.png)


## Path 2D Path Effect

Stamp the specified path to fill the shape, using the matrix to define the lattice.

| Name      | Type         |  Description                  |
|:----------|:-------------|:------------------------------|
| path      | `PathDef`    | The path to use               |
| matrix    | `SkMatrix`    |  Matrix to be applied         |
| children? | `PathEffect` | Optional path effect to apply |

### Example

```tsx twoslash
import {Canvas, Path2DPathEffect, Path, processTransform2d} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Path2D = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path path={logo} color="#61DAFB" style="stroke" strokeWidth={15}>
        <Path2DPathEffect
          path="M -10 0 L 0 -10, 10 0, 0 10 Z"
          matrix={processTransform2d([{ scale: 40 }])}
        />
      </Path>
    </Canvas> 
  );
};
```

### Result

![Corner Path Effect](assets/path-effects/path2d.png)

## Line 2D Path Effect

Stamp the specified path to fill the shape, using the matrix to define the lattice.

| Name      | Type         |  Description                  |
|:----------|:-------------|:------------------------------|
| width      | `PathDef`    | The path to use               |
| matrix    | `IMatrix`    |  Matrix to be applied         |
| children? | `PathEffect` | Optional path effect to apply |

### Example

```tsx twoslash
import {Canvas, Line2DPathEffect, Path, processTransform2d} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Line2D = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path path={logo} color="#61DAFB"  style="stroke" strokeWidth={15}>
        <Line2DPathEffect
          width={0}
          matrix={processTransform2d([{ scale: 8 }])}
        />
      </Path>
    </Canvas> 
  );
};
```

### Result

![Corner Path Effect](assets/path-effects/line2d.png)

React Native Skia works in retained mode: every re-render, we create a display list with support for animation values.
This is great to animate property values. However, if you want to execute a variable number of drawing commands, this is where you need to use pictures.

A Picture contains a list of drawing operations to be drawn on a canvas.
The picture is immutable and cannot be edited or changed after it has been created. It can be used multiple times in any canvas.

| Name    | Type        | Description       |
| :------ | :---------- | :---------------- |
| picture | `SkPicture` | Picture to render |

## Hello World

In this example, we animate a trail of circles. The number of circles in the trail changes over time, which is why we need to use pictures: we can't animated on the number of circle components.

```tsx twoslash
import React, { useEffect } from "react";
import { Canvas, Picture, Skia } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const size = 256;
const n = 20;

const paint = Skia.Paint();
const recorder = Skia.PictureRecorder();

export const HelloWorld = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, [progress]);

  const picture = useDerivedValue(() => {
    "worklet";
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
    const numberOfCircles = Math.floor(progress.value * n);
    for (let i = 0; i < numberOfCircles; i++) {
      const alpha = ((i + 1) / n) * 255;
      const r = ((i + 1) / n) * (size / 2);
      paint.setColor(Skia.Color(`rgba(0, 122, 255, ${alpha / 255})`));
      canvas.drawCircle(size / 2, size / 2, r, paint);
    }
    return recorder.finishRecordingAsPicture();
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Picture picture={picture} />
    </Canvas>
  );
};
```

| progress=0.25 | progress=0.5 | progress=1 |
| :-----------: | :----------: | :--------: |
| <img src={require("/static/img/pictures/circle-trail-0.25.png").default} width="256" height="256" /> | <img src={require("/static/img/pictures/circle-trail-0.5.png").default} width="256" height="256" /> | <img src={require("/static/img/pictures/circle-trail-1.png").default} width="256" height="256" /> |

## Applying Effects

The `Picture` component doesn't follow the same painting rules as other components.
However you can apply effects using the `layer` property.
For instance, in the example below, we apply a blur image filter.

```tsx twoslash
import React, { useMemo } from "react";
import { Canvas, Skia, Group, Paint, Blur, BlendMode, Picture } from "@shopify/react-native-skia";

export const Demo = () => {
  const picture = useMemo(() => {
    const recorder = Skia.PictureRecorder();
    const size = 256;
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
    const r = 0.33 * size;
    const paint = Skia.Paint();
    paint.setBlendMode(BlendMode.Multiply);

    paint.setColor(Skia.Color("cyan"));
    canvas.drawCircle(r, r, r, paint);

    paint.setColor(Skia.Color("magenta"));
    canvas.drawCircle(size - r, r, r, paint);

    paint.setColor(Skia.Color("yellow"));
    canvas.drawCircle(size / 2, size - r, r, paint);

    return recorder.finishRecordingAsPicture();
  }, []);
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
  Canvas,
  Picture,
  Skia,
  Group,
} from "@shopify/react-native-skia";

export const PictureExample = () => {
  // Create picture
  const picture = useMemo(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, 100, 100));

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("pink"));
    canvas.drawRect({ x: 0, y: 0, width: 100, height: 100 }, paint);

    const circlePaint = Skia.Paint();
    circlePaint.setColor(Skia.Color("orange"));
    canvas.drawCircle(50, 50, 50, circlePaint);

    return recorder.finishRecordingAsPicture();
  }, []);

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


Skottie is a Lottie animation renderer built on Skia. It allows you to load and render After Effects animations exported via Bodymovin/Lottie in React Native Skia.
It provides a powerful way to integrate After Effects animations into your React Native Skia applications with full programmatic control over animation properties.

## Rendering Animations

### Using the Skottie Component

React Native Skia provides a `Skottie` component for easy integration:

```tsx twoslash
import React from "react";
import { Canvas, Group, Skottie, Skia } from "@shopify/react-native-skia";

const legoAnimationJSON = require("./assets/lego_loader.json");
const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));

const SkottieExample = () => {
  return (
    <Canvas style={{ width: 400, height: 300 }}>
      <Group transform={[{ scale: 0.5 }]}>
        <Skottie animation={animation} frame={41} />
      </Group>
    </Canvas>
  );
};
```

### Animated Playback with Reanimated

For smooth animation playback, combine Skottie with React Native Reanimated:

```tsx twoslash
import React from "react";
import {
  Skia,
  Canvas,
  useClock,
  Group,
  Skottie,
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

const legoAnimationJSON = require("./assets/lego_loader.json");
const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));

const AnimatedSkottieExample = () => {
  const clock = useClock();
  const frame = useDerivedValue(() => {
    const fps = animation.fps();
    const duration = animation.duration();
    const currentFrame =
      Math.floor((clock.value / 1000) * fps) % (duration * fps);
    return currentFrame;
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={[{ scale: 0.5 }]}>
        <Skottie animation={animation} frame={frame} />
      </Group>
    </Canvas>
  );
};
```

### Basic Rendering

```tsx twoslash
import { Skia, Canvas } from "@shopify/react-native-skia";
const animation = {} as any;
// ---cut---
const surface = Skia.Surface.MakeOffscreen(800, 600);
if (!surface) {
  throw new Error("Failed to create surface");
}
const canvas = surface.getCanvas();

// Seek to a specific frame
animation.seekFrame(41);

// Render the animation
animation.render(canvas);

surface.flush();
const image = surface.makeImageSnapshot();
```

## Creating a Skottie Animation

To create a Skottie animation, use `Skia.Skottie.Make()` with your Lottie JSON data:

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";

const legoAnimationJSON = require("./assets/lego_loader.json");

const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));
```

### With Assets

Many Lottie animations include external assets like fonts and images. You can provide these when creating the animation:

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";

const basicSlotsJSON = require("./assets/basic_slots.json");

const assets = {
  NotoSerif: Skia.Data.fromBytes(new Uint8Array([])),
  "img_0.png": Skia.Data.fromBytes(new Uint8Array([])),
};

const animation = Skia.Skottie.Make(JSON.stringify(basicSlotsJSON), assets);
```

## Applying Effects

The `Skottie` component doesn't follow the same painting rules as other components.
This is because behind the scene, we use the Skottie module from Skia.
However you can apply effets using the `layer` property.
These are the rules as for the [ImageSVG](/docs/images-svg/#applying-effects), the [Paragraph](/docs/text/paragraph/#applying-effects), and the [Picture](/docs/shapes/pictures/#applying-effects) component.
In the example below, for instance we apply a blur filter to a Skottie animation.

```tsx twoslash
import React from "react";
import { Canvas, Skottie, Skia, Group, Paint, Blur } from "@shopify/react-native-skia";

const legoAnimationJSON = require("./assets/lego_loader.json");
const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));

export const SVG = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Group layer={<Paint><Blur blur={10} /></Paint>}>
        <Skottie animation={animation} frame={41} />
      </Group>
    </Canvas>
  );
};
```

## Animation Properties

### Basic Information

Get basic information about your animation:

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";
const animation = {} as any;
// ---cut---
// Duration in seconds
const duration = animation.duration();

// Frames per second
const fps = animation.fps();

// Lottie version
const version = animation.version();

// Animation dimensions
const size = animation.size(); // { width: 800, height: 600 }
```

## Dynamic Animation Properties

Skottie allows you to customize Lottie animations at runtime by modifying their properties programmatically. This powerful feature enables you to change colors, text, opacity, and transforms without recreating the animation, making it perfect for creating dynamic, interactive experiences.

Here's a complete example showing how to load and render a Skottie animation with Reanimated for smooth playback and dynamic properties:

```tsx twoslash
import React from "react";
import { 
  Canvas, 
  Skia, 
  useClock,
  Group,
  Skottie
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

const animationJSON = require("./assets/fingerprint.json");

// Create animation and set properties outside the component
const animation = Skia.Skottie.Make(JSON.stringify(animationJSON));
if (!animation) {
  throw new Error("Failed to create animation");
}

// Get animation properties and modify them
const colorProps = animation.getColorProps();
if (colorProps.length > 0) {
  // Change the first color property
  animation.setColor(colorProps[0].key, Skia.Color("rgb(60, 120, 255)"));
}

// Set color slots if available
const slotInfo = animation.getSlotInfo();
if (slotInfo.colorSlotIDs.length > 0) {
  animation.setColorSlot(slotInfo.colorSlotIDs[0], Skia.Color("magenta"));
}

const SkottiePlayer = () => {
  const clock = useClock();

  const frame = useDerivedValue(() => {
    const fps = animation.fps();
    const duration = animation.duration();
    const currentFrame =
      Math.floor((clock.value / 1000) * fps) % (duration * fps);
    return currentFrame;
  });

  return (
    <Canvas style={{ width: 400, height: 400 }}>
      <Group transform={[{ scale: 0.5 }]}>
        <Skottie animation={animation} frame={frame} />
      </Group>
    </Canvas>
  );
};
```

## Slot Management

Slots are placeholders built into the design of Lottie animations that allow for dynamic content replacement at runtime. This is incredibly convenient for customizing animations without recreating them - designers can create slots in After Effects, and developers can programmatically replace colors, text, images, and other properties.

Skottie supports slots for dynamic content replacement:

### Getting Slot Information

```tsx twoslash
const animation = {} as any;
// ---cut---
const slotInfo = animation.getSlotInfo();
// Returns:
// {
//   colorSlotIDs: ["FillsGroup", "StrokeGroup"],
//   imageSlotIDs: ["ImageSource"], 
//   scalarSlotIDs: ["Opacity"],
//   textSlotIDs: ["TextSource"],
//   vec2SlotIDs: ["ScaleGroup"]
// }
```

### Setting Color Slots

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";
const animation = {} as any;
// ---cut---
animation.setColorSlot("FillsGroup", Skia.Color("cyan"));
animation.setColorSlot("StrokeGroup", Skia.Color("magenta"));
```

## Property Access and Modification

Beyond slots, Skottie provides powerful introspection capabilities that allow you to modify virtually any property of the animation at runtime. This gives you complete programmatic control over colors, text, opacity, transforms, and more - making it possible to create highly dynamic and interactive animations.

### Color Properties

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";
const animation = {} as any;
// ---cut---
// Get all color properties
const colorProps = animation.getColorProps();
// Returns array of: { key: string, value: Float32Array }

// Set a specific color property
const colorProp = colorProps[0];
animation.setColor(colorProp.key, Skia.Color("rgb(60, 120, 255)"));
```

### Text Properties

```tsx twoslash
const animation = {} as any;
// ---cut---
// Get all text properties
const textProps = animation.getTextProps();
// Returns array of: { key: string, value: { text: string, size: number } }

// Set text content
animation.setText("hello!", "World", 164);
```

### Opacity Properties

```tsx twoslash
const animation = {} as any;
// ---cut---
// Get all opacity properties
const opacityProps = animation.getOpacityProps();
// Returns array of: { key: string, value: number }
```

### Transform Properties

```tsx twoslash
const animation = {} as any;
// ---cut---
// Get all transform properties
const transformProps = animation.getTransformProps();
// Returns array of: { 
//   key: string, 
//   value: {
//     anchor: { x: number, y: number },
//     position: { x: number, y: number },
//     scale: { x: number, y: number },
//     rotation: number,
//     skew: number,
//     skewAxis: number
//   }
// }
```


## Creating Snapshots of Views

The function `makeImageFromView` lets you take a snapshot of another React Native View as a Skia SkImage. The function accepts a ref to a native view and returns a promise that resolves to an `SkImage` instance upon success.

::::info

It is safer to use `collapsable=false` on the root view of the snapshot to prevent the root view from being removed by React Native.
If the view is optimized away, `makeImageFromView` will crash or return the wrong result.

::::info

### Example

```tsx twoslash
import { useState, useRef } from "react";
import { View, Text, PixelRatio, StyleSheet, Pressable } from "react-native";
import type { SkImage } from "@shopify/react-native-skia";
import { makeImageFromView, Canvas, Image } from "@shopify/react-native-skia";

const pd = PixelRatio.get();

const Demo = () => {
  // Create a ref for the view you'd like to take a snapshot of
  const ref = useRef<View>(null);
  // Create a state variable to store the snapshot
  const [image, setImage] = useState<SkImage | null>(null);
  // Create a function to take the snapshot
  const onPress = async () => {
    // Take the snapshot of the view
    const snapshot = await makeImageFromView(ref);
    setImage(snapshot);
  };
  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={onPress}>
        <View
          ref={ref}
          // collapsable={false} is important here
          collapsable={false}
          style={{ backgroundColor: "cyan", flex: 1 }}>
          <Text>This is a React Native View</Text>
        </View>
      </Pressable>
      {
        image && (
          <Canvas style={StyleSheet.absoluteFill}>
            <Image
              image={image}
              x={0}
              y={0}
              width={image.width() / pd}
              height={image.height() / pd}
            />
          </Canvas>
        )
      }
    </View>
  )
};
```


Below is a list of tutorials sorted by category.
Please [make a PR](https://github.com/Shopify/react-native-skia/edit/main/docs/docs/tutorials.md) if you would like to add entries to the list.

## 📏 SDFs
* ♟️ [The Shader's Gambit ](https://www.youtube.com/watch?v=wUsFNlas620)
* 📏 [Skia Shaders and the SDF of a Line ](https://www.youtube.com/watch?v=KgJUNYS7ZnA)
* 💧 [Liquid Glass with React Native Skia](https://www.youtube.com/watch?v=qYFMOMVZoPY)

## ✨ Animations
* 💊 [The Matrix Reacts ](https://www.youtube.com/watch?v=49QR0wUDMG0)
* 🃏 [Animated 3D Card in React Native ](https://www.youtube.com/watch?v=pVesCl7TY8A)
* 🫧 [Metaball Animation in React Native ](https://www.youtube.com/watch?v=HOxZegqnDC4)
* 🔍 [Grid Magnification in React Native Skia ](https://www.youtube.com/watch?v=zV0SGIlrtug)
* 🎛️ [Arc Slider with React-Native Skia, React-Native Gesture Handler and Reanimated 2 ](https://www.youtube.com/watch?v=fWLyKzEXaJI)
* 🎨 [Pixelated Image with React-Native Skia ](https://www.youtube.com/watch?v=_iU9i9ivTrU)
* 🔤 [Typography Metaball with React Native Skia ](https://www.youtube.com/watch?v=B8a8ty54_OI)
* 🎨 [Color Pixelated ](https://youtu.be/mc56FIJgDAE)
* ⚡ [Animated Loader with React Native Skia ](https://www.youtube.com/watch?v=7pCiGUrJuow)
* 🃏 [Animated Blur Cards with React Native Skia ](https://www.youtube.com/watch?v=SveA2QjmEzM)
* 🎯 [Basic 3D Graphics with Linear Algebra and React-Native Skia](https://youtu.be/uZBGcbKFhXE?si=AAEbWab7mx7RNAgg)

## 👋 Gestures
* 📸 [Instagram Stickers - "Can it be done in React Native?" ](https://www.youtube.com/watch?v=5yM4NPcTwY4)

## 🌁 Backdrop Filters
* 💧 [Liquid Glass with React Native Skia](https://www.youtube.com/watch?v=qYFMOMVZoPY)
* 🪟 [Glassmorphism in React Native](https://www.youtube.com/watch?v=ao2i_sOD-z0)

## 📊 Charts
* 📈 [Charts in React Native Skia ](https://www.youtube.com/watch?v=xeLdmn3se1I)
* ⭕ [Circular Progress in React Native ](https://www.youtube.com/watch?v=5-95kYTJMb4)

## ✨ Image Filters
* 🔘 [Neumorphism in React Native ](https://www.youtube.com/watch?v=GFssmWUhwww)

## 🌈 Gradients
* 🌈 [Introducing Gen-Z Mode ](https://www.youtube.com/watch?v=0FC8O9mRUmg)
* 📱 [iPhone wallpapers, but in React Native Skia](https://www.youtube.com/watch?v=Apqd749v34I)
* 🌫️ [Experimental Blur Gradient in React Native](https://www.youtube.com/watch?v=oboF_H1MApo)
* ✨ [Animated Gradient with React Native Skia ](https://www.youtube.com/watch?v=ZSPvvGU2LBg)

## 🎨 Shaders
* 🔄 [Shader Transitions ](https://www.youtube.com/watch?v=PzKWpwmmRqM)
* 📄 [Riveo Page Curl - "Can it be done in React Native?" ](https://www.youtube.com/watch?v=xNZCQvtnhIU)
* 🎯 [It's Severance, but in React Native ](https://www.youtube.com/watch?v=fMMj9oWbWL8)
* 🎨 [The Joy of Painting with React Native ](https://www.youtube.com/watch?v=GQqL1OCoOFM)
* 🌸 [Song of Bloom - "Can it be done in React Native?" ](https://www.youtube.com/watch?v=PfCQEA72ljU)

## 📐 Paths
* 🌈 [Gradient along Path ](https://www.youtube.com/watch?v=7SCzL-XnfUU)
* 🎧 [Headspace Player - "Can it be done in React Native?" ](https://www.youtube.com/watch?v=pErnuAx5GjE)
* 🌊 [Liquid Wave Progress Indicator. Skia, Reanimated, D3. ](https://youtu.be/CGcLDoZWciA)


## 📱 Native Views
* 💬 [Telegram Dark Mode - "Can it be done in React Native?" ](https://www.youtube.com/watch?v=vKYEFpO06Tk)

## 👁️ Computer Vision
* 📷 [Add Computer Vision to your Expo iOS App using React-Native Skia](https://www.youtube.com/watch?v=a51ofzf2rDo)

## 🎮 Games
* 🕹️ [Introduction to Game Development with Expo, Skia and Reanimated](https://youtu.be/Af2-OT9mE14?si=yMoznK-EpDPIYvXE)
* ⚽ [2D Game Physics with Matter.js, React Native Skia and Expo](https://www.youtube.com/watch?v=fxxaOu6pLnU)


React Native Skia provides a way to load video frames as images, enabling rich multimedia experiences within your applications.
A video frame can be used anywhere a Skia image is accepted: `Image`, `ImageShader`, and `Atlas`.
Videos are also supported on Web.

### Requirements

- **Reanimated** version 3 or higher.
- **Android:** API level 26 or higher.

## Example

Here is an example of how to use the video support in React Native Skia. This example demonstrates how to load and display video frames within a canvas, applying a color matrix for visual effects. Tapping the screen will pause and play the video.

The video can be a remote (`http://...`) or local URL (`file://`), as well as a [video from the bundle](#using-assets).

```tsx twoslash
import React from "react";
import {
  Canvas,
  ColorMatrix,
  Fill,
  ImageShader,
  useVideo
} from "@shopify/react-native-skia";
import { Pressable, useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export const VideoExample = () => {
  const paused = useSharedValue(false);
  const { width, height } = useWindowDimensions();
  const { currentFrame } = useVideo(
    "https://bit.ly/skia-video",
    {
      paused,
    }
  );
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => (paused.value = !paused.value)}
    >
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <ImageShader
            image={currentFrame}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
          <ColorMatrix
            matrix={[
              0.95, 0, 0, 0, 0.05, 0.65, 0, 0, 0, 0.15, 0.15, 0, 0, 0, 0.5, 0,
              0, 0, 1, 0,
            ]}
          />
        </Fill>
      </Canvas>
    </Pressable>
  );
};
```

## Returned Values

The `useVideo` hook returns `currentFrame`, which contains the current video frame, as well as `currentTime`, `rotation`, and `size`.

## Playback Options

The following table describes the playback options available for the `useVideo` hook:

| Option        | Description                                                                                  |
|---------------|----------------------------------------------------------------------------------------------|
| `seek`        | Allows seeking to a specific point in the video in milliseconds. Default is `null`.         |
| `paused`      | Indicates whether the video is paused.                                                      |
| `looping`     | Indicates whether the video should loop.                                                    |
| `volume`      | A value from 0 to 1 representing the volume level (0 is muted, 1 is the maximum volume).     |

In the example below, every time we tap on the video, we set the video seek at 2 seconds.

```tsx twoslash
import React from "react";
import {
  Canvas,
  Fill,
  Image,
  useVideo
} from "@shopify/react-native-skia";
import { Pressable, useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export const VideoExample = () => {
  const seek = useSharedValue<null | number>(null);
  // Set this value to true to pause the video
  const paused = useSharedValue(false);
  const { width, height } = useWindowDimensions();
  const {currentFrame, currentTime} = useVideo(
    "https://bit.ly/skia-video",
    {
      seek,
      paused,
      looping: true
    }
  );
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => (seek.value = 2000)}
    >
      <Canvas style={{ flex: 1 }}>
        <Image
          image={currentFrame}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        />
      </Canvas>
    </Pressable>
  );
};
```

## Rotated Video

The `rotation` property can be `0`, `90`, `180`, or `270`. We provide a `fitbox` function that can help with rotating and scaling the video.

```tsx twoslash
import React from "react";
import {
  Canvas,
  Image,
  useVideo,
  fitbox,
  rect
} from "@shopify/react-native-skia";
import { Pressable, useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export const VideoExample = () => {
  const paused = useSharedValue(false);
  const { width, height } = useWindowDimensions();
  const { currentFrame, rotation, size } = useVideo("https://bit.ly/skia-video");
  const src = rect(0, 0, size.width, size.height);
  const dst = rect(0, 0, width, height)
  const transform = fitbox("cover", src, dst, rotation);
  return (
    <Canvas style={{ flex: 1 }}>
      <Image
        image={currentFrame}
        x={0}
        y={0}
        width={width}
        height={height}
        fit="none"
        transform={transform}
      />
    </Canvas>
  );
};
```

## Using Assets

Below is an example where we use [expo-asset](https://docs.expo.dev/versions/latest/sdk/asset/) to load a video file from the bundle.

```tsx twoslash
import { useVideo } from "@shopify/react-native-skia";
import { useAssets } from "expo-asset";

// Example usage:
// const video = useVideoFromAsset(require("./BigBuckBunny.mp4"));
export const useVideoFromAsset = (
  mod: number,
  options?: Parameters<typeof useVideo>[1]
) => {
  const [assets, error] = useAssets([mod]);
  if (error) {
    throw error;
  }
  return useVideo(assets ? assets[0].localUri : null, options);
};
```

## Video Encoding

To encode videos from Skia images, you can use ffmpeg or also look into [react-native-skia-video](https://github.com/AzzappApp/react-native-skia-video).


---

## Animations

When integrating with [reanimated](/docs/animations/animations), we recommend using [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/).

We've prepared a few [tutorials](/docs/tutorials#-gestures) that showcase the use of advanced gestures within the context of Skia drawings.

```tsx twoslash
import { useWindowDimensions } from "react-native";
import { Canvas, Circle, Fill } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useSharedValue, withDecay } from "react-native-reanimated";

export const AnimationWithTouchHandler = () => {
  const { width } = useWindowDimensions();
  const leftBoundary = 0;
  const rightBoundary = width;
  const translateX = useSharedValue(width / 2);

  const gesture = Gesture.Pan()
    .onChange((e) => {
      translateX.value += e.changeX;
    })
    .onEnd((e) => {
      translateX.value = withDecay({
        velocity: e.velocityX,
        clamp: [leftBoundary, rightBoundary],
      });
    });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="white" />
        <Circle cx={translateX} cy={40} r={20} color="#3E3E" />
      </Canvas>
    </GestureDetector>
  );
};
```

## Element Tracking
A common use-case involves activating gestures only for a specific element on the Canvas. The Gesture Handler excels in this area as it can account for all the transformations applied to an element, such as translations, scaling, and rotations. To track each element, overlay an animated view on it, ensuring that the same transformations applied to the canvas element are mirrored on the animated view.

In the example below, each circle is tracked separately by two gesture handlers.

```tsx twoslash
import { View } from "react-native";
import { Canvas, Circle, Fill } from "@shopify/react-native-skia";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

const radius = 30;

export const ElementTracking = () => {
  // The position of the ball
  const x = useSharedValue(100);
  const y = useSharedValue(100);
  // This style will be applied to the "invisible" animated view
  // that overlays the ball
  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: -radius,
    left: -radius,
    width: radius * 2,
    height: radius * 2,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));
  // The gesture handler for the ball
  const gesture = Gesture.Pan().onChange((e) => {
    x.value += e.x;
    y.value += e.y;
  });
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Fill color="white" />
        <Circle cx={x} cy={y} r={radius} color="cyan" />
      </Canvas>
      <GestureDetector gesture={gesture}>
        <Animated.View style={style} />
      </GestureDetector>
    </View>
  );
};
```


Below are animations hooks we provide when using React Native Skia with Reanimated.
We also provide hooks for [creating textures](/docs/animations/textures) when integrating with Reanimated.

## usePathInterpolation

This hook interpolates between different path values based on a progress value, providing smooth transitions between the provided paths.

Paths need to be interpolatable, meaning they must contain the same number and types of commands. If the paths have different commands or different numbers of commands, the interpolation may not behave as expected. Ensure that all paths in the `outputRange` array are structured similarly for proper interpolation.
To interpolate two completely different paths, we found the [flubber library](https://github.com/veltman/flubber) to work well with Skia ([see example](https://github.com/wcandillon/can-it-be-done-in-react-native/blob/master/season5/src/Headspace/Play.tsx#L16)).

```tsx twoslash
import React, { useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { Skia, usePathInterpolation, Canvas, Path } from '@shopify/react-native-skia';

const angryPath = Skia.Path.MakeFromSVGString("M 16 25 C 32 27 43 28 49 28 C 54 28 62 28 73 26 C 66 54 60 70 55 74 C 51 77 40 75 27 55 C 25 50 21 40 27 55 Z")!;
const normalPath = Skia.Path.MakeFromSVGString("M 21 31 C 31 32 39 32 43 33 C 67 35 80 36 81 38 C 84 42 74 57 66 60 C 62 61 46 59 32 50 C 24 44 20 37 21 31 Z")!;
const goodPath = Skia.Path.MakeFromSVGString("M 21 45 C 21 37 24 29 29 25 C 34 20 38 18 45 18 C 58 18 69 30 69 45 C 69 60 58 72 45 72 C 32 72 21 60 21 45 Z")!;

const Demo = () => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1000 });
  }, []);

  const path = usePathInterpolation(progress, [0, 0.5, 1], [angryPath, normalPath, goodPath]);
  return (
    <Canvas style={{ flex: 1 }}>
      <Path path={path} style="stroke" strokeWidth={5} strokeCap="round" strokeJoin="round" />
    </Canvas>
  );
};
```

## usePathValue

This hooks offers an easy way to animate paths.
Behind the scene, it make sure that everything is done as efficiently as possible.
There is an optional second parameter available to set the default path value.

```tsx twoslash
import {useSharedValue, withSpring} from "react-native-reanimated";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {usePathValue, Canvas, Path, processTransform3d, Skia} from "@shopify/react-native-skia";

const rrct = Skia.Path.Make();
rrct.addRRect(Skia.RRectXY(Skia.XYWHRect(0, 0, 100, 100), 10, 10));

export const FrostedCard = () => {
  const rotateY = useSharedValue(0);

  const gesture = Gesture.Pan().onChange((event) => {
    rotateY.value -= event.changeX / 300;
  });

  const clip = usePathValue((path) => {
    "worklet";
    path.transform(
      processTransform3d([
        { translate: [50, 50] },
        { perspective: 300 },
        { rotateY: rotateY.value },
        { translate: [-50, -50] },
      ])
    );
  }, rrct);
  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Path path={clip} />
      </Canvas>
    </GestureDetector>
  );
};
```

## useClock

This hook returns a number indicating the time in milliseconds since the hook was activated.

```tsx twoslash
import { Canvas, useClock, vec, Circle } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

export default function App() {
  const t = useClock();

  const transform = useDerivedValue(() => {
    const scale = (2 / (3 - Math.cos(2 * t.value))) * 200;
    return [
      { translateX: scale * Math.cos(t.value) },
      { translateY: scale * (Math.sin(2 * t.value) / 2) },
    ];
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Circle c={vec(0, 0)} r={50} color="cyan" transform={transform} />
    </Canvas>
  );
}
```

## useRectBuffer

Creates an array for rectangle to be animated.
Can be used by any component that takes an array of rectangles as property, like the [Atlas API](/docs/shapes/atlas).

```tsx twoslash
import {useRectBuffer} from "@shopify/react-native-skia";

const width = 256;
const size = 10;
const rects = 100;
// Important to not forget the worklet directive
const rectBuffer = useRectBuffer(rects, (rect, i) => {
  "worklet";
  rect.setXYWH((i * size) % width, Math.floor(i / (width / size)) * size, size, size);
}); 
```

## useRSXformBuffer

Creates an array for [rotate scale transforms](/docs/shapes/atlas#rsxform) to be animated.
Can be used by any component that takes an array of rotate scale transforms as property, like the [Atlas API](/docs/shapes/atlas).

```tsx twoslash
import {useRSXformBuffer} from "@shopify/react-native-skia";
import {useSharedValue} from "react-native-reanimated";

const xforms = 100;
const pos = useSharedValue({ x: 0, y: 0 });
// Important to not forget the worklet directive
const transforms = useRSXformBuffer(xforms, (val, _i) => {
  "worklet";
  const r = Math.atan2(pos.value.y, pos.value.x);
  val.set(Math.cos(r), Math.sin(r), 0, 0);
});
```

React Native Skia offers integration with [Reanimated v3 and above](https://docs.swmansion.com/react-native-reanimated/), enabling the execution of animations on the UI thread.

React Native Skia supports the direct usage of Reanimated's shared and derived values as properties. There is no need for functions like `createAnimatedComponent` or `useAnimatedProps`; simply pass the Reanimated values directly as properties.

```tsx twoslash
import {useEffect} from "react";
import {Canvas, Circle, Group} from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const HelloWorld = () => {
  const size = 256;
  const r = useSharedValue(0);
  const c = useDerivedValue(() => size - r.value);
  useEffect(() => {
    r.value = withRepeat(withTiming(size * 0.33, { duration: 1000 }), -1);
  }, [r, size]);
  return (
    <Canvas style={{ flex: 1 }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={c} cy={r} r={r} color="magenta" />
        <Circle
          cx={size/2}
          cy={c}
          r={r}
          color="yellow"
        />
      </Group>
    </Canvas>
  );
};
```

We offer some [Skia specific animation hooks](/docs/animations/hooks), especially for paths.

## Colors

For colors, React Native Skia uses a different storage format from Reanimated.
This means that [`interpolateColor`](https://docs.swmansion.com/react-native-reanimated/docs/utilities/interpolateColor/) from Reanimated won't work out of the box.
Instead you can use `interpolateColors` from React Native Skia.

```tsx twoslash
import {
  Canvas,
  LinearGradient,
  Fill,
  // Use this function instead of interpolateColor from Reanimated
  interpolateColors,
  vec,
} from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const startColors = [
  "rgba(34, 193, 195, 0.4)",
  "rgba(34,193,195,0.4)",
  "rgba(63,94,251,1)",
  "rgba(253,29,29,0.4)",
];
const endColors = [
  "rgba(0,212,255,0.4)",
  "rgba(253,187,45,0.4)",
  "rgba(252,70,107,1)",
  "rgba(252,176,69,0.4)",
];

export const AnimatedGradient = () => {
  const { width, height } = useWindowDimensions();
  const colorsIndex = useSharedValue(0);
  useEffect(() => {
    colorsIndex.value = withRepeat(
      withTiming(startColors.length - 1, {
        duration: 4000,
      }),
      -1,
      true
    );
  }, []);
  const gradientColors = useDerivedValue(() => {
    return [
      interpolateColors(colorsIndex.value, [0, 1, 2, 3], startColors),
      interpolateColors(colorsIndex.value, [0, 1, 2, 3], endColors),
    ];
  });
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={gradientColors}
        />
      </Fill>
    </Canvas>
  );
};
```


In React Native Skia, we can use Reanimated to create textures on the UI thread directly.

## `useTexture`

This hook allows you to create textures from React elements.
It takes a React element and the dimensions of the texture as arguments and returns a Reanimated shared value that contains the texture.

```tsx twoslash
import { useWindowDimensions } from "react-native";
import { useTexture } from "@shopify/react-native-skia";
import { Image, Rect, rect, Canvas, Fill } from "@shopify/react-native-skia";
import React from "react";

const Demo = () => {
  const {width, height} = useWindowDimensions();
  const texture = useTexture(
      <Fill color="cyan" />,
    { width, height }
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={texture} rect={{ x: 0, y: 0, width, height }} />
    </Canvas>
  )
}
```

## `useImageAsTexture`

This hook allows you to upload an image to the GPU.
It accepts an image source as argument.
It will first load the image from its source and then upload it to the GPU.

```tsx twoslash
import { useWindowDimensions } from "react-native";
import { useImageAsTexture } from "@shopify/react-native-skia";
import { Image, Rect, rect, Canvas, Fill } from "@shopify/react-native-skia";
import React from "react";

const Demo = () => {
  const {width, height} = useWindowDimensions();
  const texture = useImageAsTexture(
    require("./assets/image.png")
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={texture} rect={{ x: 0, y: 0, width, height }} />
    </Canvas>
  )
}
```

## `usePictureAsTexture`

The hook allows you to create a texture from an `SkPicture`.
This is useful to either generate the drawing commands outside the React lifecycle or using the imperative API to build a texture.

```tsx twoslash
import {useWindowDimensions} from "react-native";
import { usePictureAsTexture } from "@shopify/react-native-skia";
import { Image, Rect, rect, Canvas, Fill, Skia } from "@shopify/react-native-skia";
import React from "react";

const rec = Skia.PictureRecorder();
const canvas = rec.beginRecording();
canvas.drawColor(Skia.Color("cyan"));
const picture = rec.finishRecordingAsPicture();

const Demo = () => {
  const {width, height} = useWindowDimensions();
  const texture = usePictureAsTexture(
    picture,
    { width, height }
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={texture} rect={{ x: 0, y: 0, width, height }} />
    </Canvas>
  )
}
```

## Under the hood

Reanimated 2 provides a [`runOnUI`](https://docs.swmansion.com/react-native-reanimated/docs/threading/runOnUI) function that enables the execution of JavaScript code on the UI thread. This function is particularly useful for creating GPU textures that can be rendered directly onto an onscreen canvas.

```tsx twoslash
import { useEffect } from "react";
import { runOnUI, useSharedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Skia, Canvas, Image } from "@shopify/react-native-skia";
import type { SkImage } from "@shopify/react-native-skia";

const createTexture = (image: SharedValue<SkImage | null>) => {
  "worklet";
  const surface = Skia.Surface.MakeOffscreen(200, 200)!;
  const canvas = surface.getCanvas();
  canvas.drawColor(Skia.Color("cyan"));
  surface.flush();
  image.value = surface.makeImageSnapshot();
}

const Demo = () => {
  const image = useSharedValue<SkImage | null>(null);
  useEffect(() => {
    runOnUI(createTexture)(image);
  }, []);
  
  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={image} x={0} y={0} width={200} height={200} />
    </Canvas>
  );
};
```

This example demonstrates how to create a texture, draw a cyan color onto it, and then display it using the `Image` component from `@shopify/react-native-skia`. The `runOnUI` function ensures that the texture creation and drawing operations are performed on the UI thread for optimal performance.

Make sure that you have installed the necessary packages and configured your project to use Reanimated 2 and `@shopify/react-native-skia` before running this code.



---

## Canvas

The Canvas component is the root of your Skia drawing.
You can treat it as a regular React Native view and assign a view style.
Behind the scenes, it is using its own React renderer.

| Name | Type     |  Description    |
|:-----|:---------|:-----------------|
| style?   | `ViewStyle` | View style |
| ref?   | `Ref<SkiaView>` | Reference to the `SkiaView` object |
| onSize? | `SharedValue<Size>` | Reanimated value to which the canvas size will be assigned  (see [canvas size](#canvas-size)) |
| androidWarmup? | `boolean` | Draw the first frame directly on the Android compositor. Use it for static icons or fully opaque drawings—animated or translucent canvases can misrender, so it remains opt-in. |

## Canvas size

The size of the canvas is available on both the UI and JS thread.

### UI thread

The `onSize` property receives a shared value, which will be updated whenever the canvas size changes.
You can see it in action in the example below.

```tsx twoslash
import {useSharedValue, useDerivedValue} from "react-native-reanimated";
import {Fill, Canvas, Rect} from "@shopify/react-native-skia";

const Demo = () => {
  // size will be updated as the canvas size changes
  const size = useSharedValue({ width: 0, height: 0 });
  const rect = useDerivedValue(() => {
    const {width, height} = size.value;
    return { x: 0, y: 0, width, height };
  });
  return (
    <Canvas style={{ flex: 1 }} onSize={size}>
      <Rect color="cyan" rect={rect} />
    </Canvas>
  );
};
```

### JS thread

To get the canvas size on the JS thread, you can use `useLayoutEffect` and `measure()`.
Since this is a very common pattern, we offer a `useCanvasSize` hook you can use for convenience.

```tsx twoslash
import {Fill, Canvas, Rect, useCanvasSize} from "@shopify/react-native-skia";

const Demo = () => {
  const {ref, size: {width, height}} = useCanvasSize();
  return (
    <Canvas style={{ flex: 1 }} ref={ref}>
      <Rect color="cyan" rect={{ x: 0, y: 0, width, height }} />
    </Canvas>
  );
};
```

This example is equivalent to the code below:

```tsx twoslash
import {useLayoutEffect, useState} from "react";
import {Fill, Canvas, Rect, useCanvasRef} from "@shopify/react-native-skia";

const Demo = () => {
  const ref = useCanvasRef();
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  useLayoutEffect(() => {
    ref.current?.measure((_x, _y, width, height) => {
      setRect({ x: 0, y: 0, width, height });
    });
  }, []);
  return (
    <Canvas style={{ flex: 1 }} ref={ref}>
      <Rect color="cyan" rect={rect} />
    </Canvas>
  );
};
```


## Getting a Canvas Snapshot

You can save your drawings as an image by using the `makeImageSnapshotAsync` method. This method returns a promise that resolves to an [Image](/docs/images).
It executes on the UI thread, ensuring access to the same Skia context as your on-screen canvases, including [textures](https://shopify.github.io/react-native-skia/docs/animations/textures).

If your drawing does not contain textures, you may also use the synchronous `makeImageSnapshot` method for simplicity.

### Example

```tsx twoslash
import {useEffect} from "react";
import {Canvas, useCanvasRef, Circle} from "@shopify/react-native-skia";

export const Demo = () => {
  const ref = useCanvasRef();
  useEffect(() => {
    setTimeout(() => {
      // you can pass an optional rectangle
      // to only save part of the image
      const image = ref.current?.makeImageSnapshot();
      if (image) {
        // you can use image in an <Image> component
        // Or save to file using encodeToBytes -> Uint8Array
        const bytes = image.encodeToBytes();
        console.log({ bytes });
      }
    }, 1000)
  });
  return (
    <Canvas style={{ flex: 1 }} ref={ref}>
      <Circle r={128} cx={128} cy={128} color="red" />
    </Canvas>
  );
};
```

## Accessibility

The Canvas component supports the same properties as a View component including its [accessibility properties](https://reactnative.dev/docs/accessibility#accessible).
You can make elements inside the canvas accessible as well by overlaying views on top of your canvas.
This is the same recipe used for [applying gestures on specific canvas elements](https://shopify.github.io/react-native-skia/docs/animations/gestures/#element-tracking).


React Native Skia is using its own React renderer.
It is currently impossible to automatically share a React context between two renderers.
This means that a React Native context won't be available from your drawing directly.
We recommend preparing the data needed for your drawing outside the `<Canvas>` element.
However, if you need to use a React context within your drawing, you must re-inject it.

We found [its-fine](https://github.com/pmndrs/its-fine), also used by [react-three-fiber](https://github.com/pmndrs/react-three-fiber), to provide an elegant solution to this problem.

## Using `its-fine`

```tsx twoslash
import React from "react";
import { Canvas, Fill } from "@shopify/react-native-skia";
import {useTheme, ThemeProvider, ThemeContext} from "./docs/getting-started/Theme";
import { useContextBridge, FiberProvider } from "its-fine";

const MyDrawing = () => {
  const { primary } = useTheme();
  return <Fill color={primary} />;
};

export const Layer = () => {
  const ContextBridge = useContextBridge();
  return (
    <Canvas style={{ flex: 1 }}>
      <ContextBridge>
        <Fill color="black" />
        <MyDrawing />
      </ContextBridge>
    </Canvas>
  );
};

export const App = () => {
  return (
    <FiberProvider>
      <ThemeProvider primary="red">
        <Layer />
      </ThemeProvider>
    </FiberProvider>
  );
};
```

Below is the context definition that was used in this example:

```tsx twoslash
import type { ReactNode } from "react";
import React, { useContext, createContext } from "react";

interface Theme {
  primary: string;
}

export const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider = ({
  primary,
  children,
}: {
  primary: string;
  children: ReactNode;
}) => (
  <ThemeContext.Provider value={{ primary }}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (theme === null) {
    throw new Error("Theme provider not found");
  }
  return theme;
};
```


React Native Skia supports two rendering paradigms: **Retained Mode** and **Immediate Mode**. Understanding when to use each is key to building performant graphics applications.

## Retained Mode (Default)

In retained mode, you declare your scene as a tree of React components. React Native Skia converts this tree into a display list (a series of drawing commands) that can be efficiently animated without re-creating the tree.

```tsx twoslash
import { Canvas, Circle, Group } from "@shopify/react-native-skia";
import { useSharedValue, withSpring } from "react-native-reanimated";

export const RetainedModeExample = () => {
  const radius = useSharedValue(50);

  return (
    <Canvas style={{ flex: 1 }} onTouch={() => {
      radius.value = withSpring(radius.value === 50 ? 100 : 50);
    }}>
      <Group>
        <Circle cx={128} cy={128} r={radius} color="cyan" />
      </Group>
    </Canvas>
  );
};
```

### How It Works

1. **Scene Declaration**: You define your scene using React components (`<Circle>`, `<Rect>`, `<Path>`, etc.)
2. **Display List Creation**: React Native Skia traverses this tree and creates a display list
3. **Animation**: When animated values (Reanimated shared values) change, only the affected properties update—the tree structure remains unchanged
4. **Zero FFI Cost**: During animations, there's virtually no JavaScript-to-native bridge crossing

### Trade-offs

We intentionally made the JavaScript tree creation slightly slower in order to be much faster at animation time. This is the right trade-off for most UI use cases where:
- The scene structure is relatively stable
- Properties (position, color, scale, etc.) change frequently
- Smooth 60fps animations are critical

### Best For

- User interfaces with animated transitions
- Charts and data visualizations
- Interactive graphics where structure is fixed but properties change
- Any scene where the number of elements doesn't change frame-to-frame

## Immediate Mode

In immediate mode, you issue drawing commands directly to a canvas on every frame. This gives you complete control over what gets drawn and when, but requires you to manage the drawing logic yourself.

React Native Skia provides immediate mode through the [Picture API](/docs/shapes/pictures).

```tsx twoslash
import { Canvas, Picture, Skia } from "@shopify/react-native-skia";
import { useDerivedValue, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";

const size = 256;

export const ImmediateModeExample = () => {
  const progress = useSharedValue(0);
  const recorder = Skia.PictureRecorder();
  const paint = Skia.Paint();

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, [progress]);

  const picture = useDerivedValue(() => {
    "worklet";
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));

    // Variable number of circles based on progress
    const count = Math.floor(progress.value * 20);
    for (let i = 0; i < count; i++) {
      const r = (i + 1) * 6;
      paint.setColor(Skia.Color(`rgba(0, 122, 255, ${(i + 1) / 20})`));
      canvas.drawCircle(size / 2, size / 2, r, paint);
    }

    return recorder.finishRecordingAsPicture();
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Picture picture={picture} />
    </Canvas>
  );
};
```

### When to Use Immediate Mode

Use the Picture API when you need to:
- Draw a **variable number of elements** that changes each frame
- Implement **procedural graphics** or generative art
- Build **particle systems** where particles are created/destroyed dynamically
- Render **game-like content** where the scene changes unpredictably

## Choosing the Right Mode

| Scenario | Recommended Mode | Why |
|:---------|:-----------------|:----|
| UI with animated properties | Retained | Zero FFI cost during animation |
| Fixed number of sprites/tiles | Retained + Atlas | Single draw call, worklet transforms |
| Particle system | Immediate (Picture) | Variable element count |
| Procedural/generative art | Immediate (Picture) | Dynamic drawing commands |
| Data visualization | Retained | Structure usually fixed |
| Game with dynamic entities | Immediate (Picture) | Entities created/destroyed |

## Retained Mode with Atlas

For rendering large numbers of similar objects (like tiles in a game map), the [Atlas API](/docs/shapes/atlas) provides the best of both worlds: retained mode's animation performance with efficient batch rendering.

```tsx twoslash
import { Canvas, Atlas, useImage, rect, useRSXformBuffer } from "@shopify/react-native-skia";
import { useSharedValue } from "react-native-reanimated";
import { useMemo } from "react";

const TILE_SIZE = 32;
const TILE_COUNT = 100;

export const AtlasExample = () => {
  const atlas = useImage(require("./sprites.png"));
  const scrollX = useSharedValue(0);

  // Static sprite definitions (which part of atlas to use)
  const sprites = useMemo(() =>
    new Array(TILE_COUNT).fill(0).map(() =>
      rect(0, 0, TILE_SIZE, TILE_SIZE)
    ),
  []);

  // Transforms computed on UI thread - responds to scrollX changes
  const transforms = useRSXformBuffer(TILE_COUNT, (val, i) => {
    "worklet";
    const col = i % 10;
    const row = Math.floor(i / 10);
    const tx = col * TILE_SIZE - scrollX.value;
    const ty = row * TILE_SIZE;
    val.set(1, 0, tx, ty);  // scale=1, rotation=0, translate
  });

  if (!atlas) return null;

  return (
    <Canvas style={{ flex: 1 }}>
      <Atlas image={atlas} sprites={sprites} transforms={transforms} />
    </Canvas>
  );
};
```

### Why Atlas for Tiles/Sprites?

1. **Single Draw Call**: All sprites rendered in one GPU operation
2. **Worklet Transforms**: Position/rotation/scale computed on UI thread
3. **No React Reconciliation**: Sprite count is fixed, no tree updates needed
4. **Retained Mode Benefits**: Animating `scrollX` doesn't recreate the scene

This pattern is ideal for:
- Tile-based maps (strategy games, platformers)
- Sprite-based animations
- Large grids of similar elements
- Any scene with many instances of the same texture

## Summary

| Mode | API | Scene Structure | Animation Cost | Use Case |
|:-----|:----|:----------------|:---------------|:---------|
| Retained | Components | Fixed | Near-zero | UI, visualizations |
| Retained + Atlas | `<Atlas>` | Fixed (batched) | Near-zero | Sprites, tiles |
| Immediate | `<Picture>` | Dynamic | Per-frame rebuild | Particles, procedural |

Start with retained mode (regular components). If you need many similar objects, use Atlas. Only reach for Picture when you truly need dynamic scene structure.



---

## Getting Started

Below is the app size increase to be expected when adding React Native Skia to your project.

| Apple    | Android      | Web      |
|----------|--------------| -------- |
| 6 MB     | 4 MB         | 2.9 MB\* |

\*This figure is the size of the gzipped file served through a CDN ([learn more](web)).

React Native Skia includes both prebuilt library files and C++ files that are compiled and linked with your app when being built - adding to the size of your app.

For a regular arm 64-bit **Android** device, the increased download size will be around **4 MB** added after adding React Native Skia - on **Apple**, the increased download size will be around **6 MB**.

Below is an explanation of how these numbers were found - using a bare-bones React Native app created with `npx react-native init` before and after adding React Native Skia.

## Android

_On *Android* you should use [App Bundles](https://developer.android.com/guide/app-bundle) to ensure that only the required files are downloaded to your user’s devices._

When building an APK in release mode, you will see an increase of 41.3 MB after adding React Native Skia.
This is because the library is built for different target architectures.
If we take `arm-64-bit` for instance, the `librnskia.so` library file is only around 3,8 MB.

This implies that if you distribute your apps using [App Bundles](https://developer.android.com/guide/app-bundle), the increase in download size should be around 4 MB on Android devices when distributed (including an increase of 220 KB to the Javascript Bundle).

### Apple

Unlike Android, there is no standard way to find the app size increase on iOS - but by archiving and distributing our build using the Ad-Hoc distribution method, we'll find some numbers in the report "App Thinning Size.txt":

**Base app:** 2,6 MB compressed, 7,2 MB uncompressed<br />
**With React Native Skia:** 5,2 MB compressed, 13 MB uncompressed

Meaning that we’ve increased the size of our app by around 5,8 MB after adding React Native Skia. If we add the increased Javascript bundle of about 220 KB, we end up with about 6 MB of increased download size after including React Native Skia.

### NPM Package

The NPM download is bigger than these numbers indicate because we need to distribute Skia for all target platforms on both iOS and Android.


Thanks to its offscreen capabilities, React Native Skia can run on Node.
This means that you can use the Skia API to draw things that can be encoded and saved as images.
By default, drawings will be executed on the CPU but it is possible to also use [GPU Acceleration](#gpu-acceleration).

## Hello World

You will notice in the example below that the import URL looks different than the one used in React Native. There are two reasons for it. First, because Node programs don't rely on module bundlers such as Webpack, you will need to use the commonjs build of React Native Skia. Finally, we want to import the Skia APIs we need on Node without importing the one that rely on pure React Native APIs.

```tsx
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/commonjs/web/LoadSkiaWeb";
import { Circle, drawOffscreen, getSkiaExports, Group, makeOffscreenSurface } from "@shopify/react-native-skia/lib/commonjs/headless";

(async () => {
  const width = 256;
  const height = 256;
  const size = 60;
  const r = size * 0.33;
  await LoadSkiaWeb();
  // Once that CanvasKit is loaded, you can access Skia via getSkiaExports()
  // Alternatively you can do const {Skia} = require("@shopify/react-native-skia")
  const {Skia} = getSkiaExports();
  using surface = makeOffscreenSurface(width, height);
  using image = await drawOffscreen(surface,
    <Group blendMode="multiply">
      <Circle cx={r} cy={r} r={r} color="cyan" />
      <Circle cx={size - r} cy={r} r={r} color="magenta" />
      <Circle
        cx={size/2}
        cy={size - r}
        r={r}
        color="yellow"
      />
    </Group>);
  console.log(image.encodeToBase64());
})();
```

## GPU Acceleration

React Native Skia relies on the [OffscreenCanvas API](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) to support GPU-Accelerated offscreen surfaces.
This means, that to benefit from the GPU acceleration, you will need to provide a polyfill of the [OffscreenCanvas API](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) on Node.
For example, [here](https://gist.github.com/wcandillon/a46e922910a814139758d6eda9d99ff8) is an OffScreenCanvas polyfill implementation that relies on WebGL using [headless-gl](https://github.com/stackgl/headless-gl).


React Native Skia provides a declarative API using its own React Renderer.

```tsx twoslash
import React from "react";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";

const App = () => {
  const width = 256;
  const height = 256;
  const r = width * 0.33;
  return (
    <Canvas style={{ width, height }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={width - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};

export default App;
```

### Result

<img src={require("/static/img/getting-started/hello-world/blend-modes.png").default} width="256" height="256" alt="Hello World" />


React Native Skia brings the [Skia Graphics Library](https://skia.org/) to React Native.
Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox, Firefox OS, and many other products.

**Version compatibility:**
`react-native@>=0.79` and `react@>=19` are required. <br />
In addition you should make sure you're on at least `iOS 14` and `Android API level 21` or above. <br />
To use React Native Skia with video support, `Android API level 26` or above is required.

For `react-native@<=0.78` and `react@<=18`, you need to use `@shopify/react-native-skia` version `1.12.4` or below.

tvOS, macOS, and macOS Catalyst are also supported platforms.

```sh
yarn add @shopify/react-native-skia
# or
npm install @shopify/react-native-skia
```

If you're using **bun** or **pnpm**, you'll need to trust the package for the postinstall script to run:

```sh
# bun
bun add --trust @shopify/react-native-skia

# pnpm (v10+)
pnpm add --allow-build=@shopify/react-native-skia @shopify/react-native-skia
```

### Using Expo

Expo provides a `with-skia` template, which you can use to create a new project.

```bash
yarn create expo-app my-app -e with-skia
# or
npx create-expo-app my-app -e with-skia
```

<video width="61%" autoPlay loop muted playsInline>
  <source src="https://firebasestorage.googleapis.com/v0/b/start-react-native.appspot.com/o/expo-template2.mp4?alt=media&token=cdc13f16-9c5a-488a-b5d6-19d11f3e1842" type="video/mp4" />
</video>

### Bundle Size

Below is the app size increase to be expected when adding React Native Skia to your project ([learn more](bundle-size)).

| iOS  | Android | Web    |
| ---- | ------- | ------ |
| 6 MB | 4 MB    | 2.9 MB |

## iOS

Run `pod install` on the `ios/` directory.

## Android

Currently, you will need Android NDK to be installed.
If you have Android Studio installed, make sure `$ANDROID_NDK` is available.
`ANDROID_NDK=/Users/username/Library/Android/sdk/ndk/<version>` for instance.

If the NDK is not installed, you can install it via Android Studio by going to the menu _File > Project Structure_

And then the _SDK Location_ section. It will show you the NDK path, or the option to download it if you don't have it installed.

### Proguard

If you're using Proguard, make sure to add the following rule at `proguard-rules.pro`:

```
-keep class com.shopify.reactnative.skia.** { *; }
```

### TroubleShooting

For error **_CMake 'X.X.X' was not found in SDK, PATH, or by cmake.dir property._**

open _Tools > SDK Manager_, switch to the _SDK Tools_ tab.
Find `CMake` and click _Show Package Details_ and download compatiable version **'X.X.X'**, and apply to install.

## Web

To use this library in the browser, see [these instructions](/docs/getting-started/web).

## TV

Starting from version [1.9.0](https://github.com/Shopify/react-native-skia/releases/tag/v1.9.0) React Native Skia supports running on TV devices using [React Native TVOS](https://github.com/react-native-tvos/react-native-tvos).
Currently both Android TV and Apple TV are supported.

:::info

Not all features have been tested yet, so please [report](https://github.com/Shopify/react-native-skia/issues) any issues you encounter when using React Native Skia on TV devices.

:::

## Debugging

We recommend using React Native DevTools to debug your JS code — see the [React Native docs](https://reactnative.dev/docs/debugging). Alternatively, you can debug both JS and platform code in VS Code and via native IDEs. If using VS Code, we recommend [Expo Tools](https://github.com/expo/vscode-expo), [Radon IDE](https://ide.swmansion.com/), or Microsoft's [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native#debugging-react-native-applications).

## Testing with Jest

React Native Skia test mocks use a web implementation that depends on loading CanvasKit.

The very first step is to make sure that your Skia files are not being transformed by jest, for instance, we can add it the `transformIgnorePatterns` directive:
```js
"transformIgnorePatterns": [
  "node_modules/(?!(react-native|react-native.*|@react-native.*|@?react-navigation.*|@shopify/react-native-skia)/)"
]
```

You also need to add the following to your `jest.config.js` file:

```js
// jest.config.js
module.exports = {
  // Other values
  testEnvironment: "@shopify/react-native-skia/jestEnv.js",
  setupFilesAfterEnv: [
    "@shopify/react-native-skia/jestSetup.js",
  ],
};
```

The `jestEnv.js` will load CanvasKit for you and `jestEnv.js` mocks React Native Skia.
You can also have a look at the [example app](https://github.com/Shopify/react-native-skia/tree/main/apps/example) to see how Jest tests are enabled there.


## Playground

We have example projects you can play with [here](https://github.com/Shopify/react-native-skia/tree/main/apps).
It would require you first to [build Skia locally](https://github.com/shopify/react-native-skia?tab=readme-ov-file#library-development) first.


import {Snack} from '@site/src/components/Snack';

React Native Skia runs in the browser via [CanvasKit](https://skia.org/docs/user/modules/canvaskit/), a WebAssembly (WASM) build of Skia.
The CanvasKit WASM file, which is 2.9MB when gzipped, is loaded asynchronously.
Despite its considerable size, it offers flexibility in determining when and how Skia loads, giving you full control over the user experience.

We support direct integration with [Expo](#expo) and [Remotion](#remotion).
Additionally, you'll find manual installation steps for any webpack projects.

It should also be mentionned that React Native Skia can be used on projects without the need to install React Native Web.

## Expo

### Automatic configuration

For new Expo Router projects, we recommend using the Expo Skia template which sets up web support automatically:

```bash
yarn create expo-app my-app -e with-skia
# or
npx create-expo-app my-app -e with-skia
```

This template includes the proper configuration for web support out of the box, so you don't need to manually configure loading methods.

<video width="61%" autoPlay loop muted playsInline>
  <source src="https://firebasestorage.googleapis.com/v0/b/start-react-native.appspot.com/o/expo-template2.mp4?alt=media&token=cdc13f16-9c5a-488a-b5d6-19d11f3e1842" type="video/mp4" />
</video>

### Manual configuration

Use the `setup-skia-web` script to ensure that the `canvaskit.wasm` file is accessible within your Expo project's public folder.
If you're [loading CanvasKit from a CDN](#using-a-cdn), running the `setup-skia-web` script is unnecessary.

```bash
$ npx expo install @shopify/react-native-skia
$ yarn setup-skia-web
```

Run `yarn setup-skia-web` each time you upgrade the `@shopify/react-native-skia` package.
Consider incorporating it into your `postinstall` script for convenience.

After setup, choose your method to [Load Skia](#loading-skia).

For existing projects using Expo Router, you can use [code-splitting](#using-code-splitting) or [deferred component registration](#using-deferred-component-registration).
If you wish to use deferred component registration with Expo Router, you need to create your own `main` property in `package.json`.
For instance, if you've created `index.tsx` and `index.web.tsx` in your root directory, update your `package.json` accordingly:
```patch
-  "main": "expo-router/entry",
+  "main": "index",
```

Below is an example of `index.web.tsx`:

```tsx
import '@expo/metro-runtime';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

LoadSkiaWeb().then(async () => {
  renderRootComponent(App);
});
```

For the `index.tsx` file, directly invoke `renderRootComponent(App)`.

## Remotion

Follow these [installation steps](https://remotion.dev/skia) to use React Native Skia with Remotion.

## Loading Skia

Ensure Skia is fully loaded and initialized before importing the Skia module.
Two methods facilitate Skia's loading:
* `<WithSkiaWeb />` for code-splitting, delaying the loading of Skia-importing components.
* `LoadSkiaWeb()` to defer root component registration until Skia loads.

### Using Code-Splitting

The `<WithSkiaWeb>` component utilizes [code splitting](https://reactjs.org/docs/code-splitting.html) to preload Skia.
The following example demonstrates preloading Skia before rendering the `MySkiaComponent`:

```tsx
import React from 'react';
import { Text } from "react-native";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

export default function App() {
  return (
    <WithSkiaWeb
      // import() uses the default export of MySkiaComponent.tsx
      getComponent={() => import("@/components/MySkiaComponent")}
      fallback={<Text>Loading Skia...</Text>}
    />
  );
}
```
:::info

When using expo router in dev mode you cannot load components that are inside the app directory, as they will get evaluated by the router before CanvasKit is loaded.
Make sure the component to load lies outside the 'app' directory.

:::

### Using Deferred Component Registration

The `LoadSkiaWeb()` function facilitates Skia's loading prior to the React app's initiation.
Below is an `index.web.js` example:

```tsx
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

LoadSkiaWeb().then(async () => {
  const App = (await import("./src/App")).default;
  AppRegistry.registerComponent("Example", () => App);
});
```

## Using a CDN

Below, CanvasKit loads via code-splitting from a CDN.
It is critical that the CDN-hosted CanvasKit version aligns with React Native Skia's requirements.

```tsx
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { version } from 'canvaskit-wasm/package.json';

export default function App() {
  return (
    <WithSkiaWeb
      opts={{ locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${version}/bin/full/${file}` }}
      getComponent={() => import("./MySkiaComponent")}
    />
  );
}
```

Alternatively, use deferred component registration:

```tsx
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { version } from 'canvaskit-wasm/package.json';

LoadSkiaWeb({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${version}/bin/full/${file}`
}).then(async () => {
  const App = (await import("./src/App")).default;
  AppRegistry.registerComponent("Example", () => App);
});
```

## WebGL Contextes

Web browsers limit the number of WebGL contexts to 16 per webpage.
Usually developers will see this error when they exceed this limit:

```
WARNING: Too many active WebGL contexts. Oldest context will be lost.
```
If you canvas is static and doesn't contain animation values, you can use the `__destroyWebGLContextAfterRender={true}` prop on your Canvas components to destroy the WebGL context after rendering.
This even works with animated canvases but it will come with a performance cost as the context will be recreated on each render.

```tsx twoslash
import { View } from 'react-native';
import { Canvas, Fill } from "@shopify/react-native-skia";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      {
        // 20 Skia Canvases with __destroyWebGLContextAfterRender={true}
        new Array(20).fill(0).map((_, i) => (
          <Canvas key={i} style={{ width: 100, height: 100 }} __destroyWebGLContextAfterRender={true}>
            <Fill color="lightblue" />
          </Canvas>
        ))
      }
    </View>
  );
}
```

## Unsupported Features

The following React Native Skia APIs are currently unsupported on React Native Web.
To request these features, please submit [a feature request on GitHub](https://github.com/Shopify/react-native-skia/issues/new/choose).

**Unsupported**

* `PathEffectFactory.MakeSum()`
* `PathEffectFactory.MakeCompose()`
* `PathFactory.MakeFromText()`
* `ShaderFilter`

## Manual webpack Installation

To enable React Native Skia on Web using webpack, three key actions are required:

- Ensure the `canvaskit.wasm` file is accessible to the build system.
- Configure the build system to resolve the `fs` and `path` node modules, achievable via the [node polyfill plugin](https://www.npmjs.com/package/node-polyfill-webpack-plugin).
- Update aliases for `react-native-reanimated` and `react-native/Libraries/Image/AssetRegistry` so webpack can do the bundle.

Here is an example webpack v5 configuration accommodating React Native Skia:

```tsx
import fs from "fs";
import { sources } from "webpack";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const newConfiguration = {
  ...currentConfiguration,
  plugins: [
    ...currentConfiguration.plugins,
    // 1. Ensure wasm file availability
    new (class CopySkiaPlugin {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap("AddSkiaPlugin", (compilation) => {
          compilation.hooks.processAssets.tapPromise(
            {
              name: "copy-skia",
              stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            },
            async () => {
              const src = require.resolve("canvaskit-wasm/bin/full/canvaskit.wasm");
              if (!compilation.getAsset(src)) {
                compilation.emitAsset("/canvaskit.wasm", new sources.RawSource(await fs.promises.readFile(src)));
              }
            }
          );
        });
      }
    })(),
    // 2. Polyfill fs and path modules


    new NodePolyfillPlugin()
  ],
  alias: {
    ...currentConfiguration.alias,
    // 3. Suppress reanimated module warning
    // This assumes Reanimated is installed, if not you can use false.
    "react-native-reanimated/package.json": require.resolve(
      "react-native-reanimated/package.json"
    ),
    "react-native-reanimated": require.resolve("react-native-reanimated"),
    "react-native/Libraries/Image/AssetRegistry": false,
  },
}
```

Finally, proceed to [load Skia](#loading-skia).



---

## Image Filters

Creates an image filter that blurs its input by the separate X and Y sigmas.
The provided tile mode is used when the blur kernel goes outside the input image.

| Name      | Type                 |  Description                                                  |
|:----------|:---------------------|:--------------------------------------------------------------|
| blur      | `number` or `Vector` | The Gaussian sigma blur value                                 |
| mode?     | `TileMode`           | `mirror`, `repeat`, `clamp`, or `decal` (default is `decal`). |
| children? | `ImageFilter`        | Optional image filter to be applied first.                    | 

## Simple Blur

```tsx twoslash
import { Canvas, Blur, Image, useImage } from "@shopify/react-native-skia";

const BlurImageFilter = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Image
        x={0}
        y={0}
        width={256}
        height={256}
        image={image}
        fit="cover"
      >
        <Blur blur={4} />
      </Image>
    </Canvas>
  );
};
```

![Simple Blur](./assets/decal-blur.png)

## With mode="clamp"

![Clamp Blur](./assets/clamp-blur.png)


The displacement map image filter is identical to its [SVG counterpart](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap). The pixel values from the child image are used to displace the filtered image spatially.
The formula for the transformation looks like this:

```
P'(x,y) ← P( x + scale * (XC(x,y) - 0.5), y + scale * (YC(x,y) - 0.5))
```

where `P(x,y)` is the child image, and `P'(x,y)` is the destination. `XC(x,y)` and `YC(x,y)` are the component values of the channel designated by `channelX` and `channelY`.

| Name      | Type           |  Description                                                                          |
|:----------|:---------------|:--------------------------------------------------------------------------------------|
| channelX  | `ColorChannel` | Color channel to be used along the X axis. Possible values are `r`, `g`, `b`, or `a` |
| channelY  | `ColorChannel` | Color channel to be used along the Y axis. Possible values are `r`, `g`, `b`, or `a` |
| scale     | `number`       | Displacement scale factor to be used                                                  |
| children? | `ImageFilter`  | Optional image filter to be applied first.                                            | 

## Example

We use a [Perlin Noise](/docs/shaders/perlin-noise) as a displacement map in the example below.

```tsx twoslash
import { Canvas, Image, Turbulence, DisplacementMap, useImage } from "@shopify/react-native-skia";

const Filter = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Image
        image={image}
        x={0}
        y={0}
        width={256}
        height={256}
        fit="cover"
      >
        <DisplacementMap channelX="g" channelY="a" scale={20}>
          <Turbulence freqX={0.01} freqY={0.05} octaves={2} seed={2} />
        </DisplacementMap>
      </Image>
    </Canvas>
  );
};
```

<img src={require("/static/img/displacement-map.png").default} width="256" height="256" />


The morphology image filter is identical to its [SVG counterpart](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMorphology).
It is used to erode or dilate the input image.
Its usefulness lies primarily in fattening or thinning effects.

| Name      | Type                 |  Description                                                        |
|:----------|:---------------------|:--------------------------------------------------------------------|
| operator  | `erode` or `dilate`  | whether to erode (i.e., thin) or dilate (fatten). Default is dilate |
| radius    | `number` or `Vector` | Radius of the effect.                                               |
| children? | `ImageFilter`        | Optional image filter to be applied first.                          | 

## Example

```tsx twoslash
import {Canvas, Text, Morphology, useFont} from "@shopify/react-native-skia";

export const MorphologyDemo = () => {
  const font = useFont(require("./SF-Pro.ttf"), 24);
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Text
        text="Hello World"
        x={32}
        y={32}
        font={font}
      />
      <Text
        text="Hello World"
        x={32}
        y={64}
        font={font}
      >
        <Morphology radius={1} />
      </Text>
      <Text
        text="Hello World"
        x={32}
        y={96}
        font={font}
      >
        <Morphology radius={0.3} operator="erode" />
      </Text>
    </Canvas>
  );
};
```

<img src={require("/static/img/image-filters/morphology.png").default} width="256" height="256" />


This offset filter is identical to its [SVG counterpart](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feOffset). It allows offsetting the filtered image. 

| Name      | Type           |  Description                               |
|:----------|:---------------|:-------------------------------------------|
| x         | `number`       | Offset along the X axis.                   |
| y         | `number`       | Offset along the Y axis.                   |
| children? | `ImageFilter`  | Optional image filter to be applied first. | 

## Example

```tsx twoslash
import { Canvas, Image, Offset, useImage, Fill } from "@shopify/react-native-skia";

const Filter = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill color="lightblue" />
      <Image
        image={image}
        x={0}
        y={0}
        width={256}
        height={256}
        fit="cover"
      >
        <Offset x={64} y={64} />
      </Image>
    </Canvas>
  );
};
```

<img src={require("/static/img/image-filters/offset.png").default} width="256" height="256" />


Image filters are effects that operate on all the color bits of pixels that make up an image.

## Composing Filters

Color Filters and Shaders can also be used as Image filters.
In the example below, we first apply a color matrix to the content and a blur image filter.

```tsx twoslash
import { Canvas, Blur, Image, ColorMatrix, useImage } from "@shopify/react-native-skia";

const ComposeImageFilter = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Image
        x={0}
        y={0}
        width={256}
        height={256}
        image={image}
        fit="cover"
      >
        <Blur blur={2} mode="clamp">
          <ColorMatrix
            matrix={[
              -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015,
              1.69, -0.703, 0, 0, 0, 0, 0, 1, 0,
            ]}
          />
        </Blur>
      </Image>
    </Canvas>
  );
};
```

<img src={require("/static/img/image-filters/composing.png").default} width="256" height="256" />


The `RuntimeShader` image filter allows you to write your own [Skia Shader](/docs/shaders/overview) as an image filter.
This component receives the currently filtered image as a shader uniform (or the implicit source image if no children are provided).

:::info

Because RuntimeShader doesn't take into account the pixel density scaling, we recommend applying a technique known as supersampling. [See below](#pixel-density).

:::


| Name      | Type              |  Description                     |
|:----------|:------------------|:---------------------------------|
| source    | `SkRuntimeEffect` | Shader to use as an image filter |
| children? | `ImageFilter`   | Optional image filter to be applied first |


## Example

The example below generates a circle with a green mint color.
The circle is first drawn with the light blue color `#add8e6`, and the runtime shader switches the blue with the green channel: we get mint green `#ade6d8`.

```tsx twoslash
import {Canvas, Text, RuntimeShader, Skia, Group, Circle} from "@shopify/react-native-skia";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;

half4 main(float2 xy) {
  return image.eval(xy).rbga;
}
`)!;

export const RuntimeShaderDemo = () => {
  const r = 128;
  return (
    <Canvas style={{ flex: 1 }}>
      <Group>
        <RuntimeShader source={source} />
        <Circle cx={r} cy={r} r={r} color="lightblue" />
      </Group>
    </Canvas>
  );
};
```

<img alt="Runtime Shader" src={require("/static/img/image-filters/runtime-shader.png").default} width="256" height="256" />

## Pixel Density

`RuntimeShader` is not taking into account the pixel density scaling ([learn more why](https://issues.skia.org/issues/40044507)).
To keep the image filter output crisp, We upscale the filtered drawing to the [pixel density of the app](https://reactnative.dev/docs/pixelratio). Once the drawing is filtered, we scale it back to the original size. This can be seen in the example below. These operations must be performed on a Skia layer via the `layer` property.

```tsx twoslash
import {Canvas, Text, RuntimeShader, Skia, Group, Circle, Paint, Fill, useFont} from "@shopify/react-native-skia";
import {PixelRatio} from "react-native";

const pd = PixelRatio.get();
const source = Skia.RuntimeEffect.Make(`
uniform shader image;

half4 main(float2 xy) {
  if (xy.x < 256 * ${pd}/2) {
    return color;
  }
  return image.eval(xy).rbga;
}
`)!;

export const RuntimeShaderDemo = () => {
  const r = 128;
  const font = useFont(require("./SF-Pro.ttf"), 24);
  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={[{ scale: 1 / pd }]}>
        <Group
          layer={
            <Paint>
              <RuntimeShader source={source} />
            </Paint>
          }
          transform={[{ scale: pd }]}
        >
          <Fill color="#b7c9e2" />
          <Text
            text="Hello World"
            x={16}
            y={32}
            color="#e38ede"
            font={font}
          />
        </Group>
      </Group>
    </Canvas>
  );
};
```

<table style={{ width: '100%' }}>
    <tr>
      <td><b>With supersampling</b></td>
      <td><b>Without supersampling</b></td>
    </tr>
    <tr>
        <td style={{ textAlign: 'left', width: '50%' }}>
          <div style={{ overflow: 'hidden', height: 100 }}>
          <img
            alt="Runtime Shader" 
            src={require("/static/img/runtime-shader/with-supersampling.png").default}
            style={{ width: 512, height: 512 }}
          />
          </div>
        </td>
        <td style={{ textAlign: 'right', width: '50%' }}>
          <div style={{ overflow: 'hidden', height: 100 }}>
          <img
            alt="Runtime Shader"
            src={require("/static/img/runtime-shader/without-supersampling.png").default}
            style={{ width: 512, height: 512 }}
          />
          </div>
        </td>
    </tr>
</table>


The `DropShadow` image filter is equivalent to its [SVG counterpart](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow()).
It creates a filter that draws a drop shadow under the input content.
A `shadowOnly` property renders the drop shadow, excluding the input content.
It can also render an inner shadow via the `inner` property.

If you want to render inner shadows to a rounded rectangle, [box shadows](/shapes/box.md) are much faster.

| Name        | Type          |  Description                                                  |
|:------------|:--------------|:--------------------------------------------------------------|
| dx          | `number`      | The X offset of the shadow.                                   |
| dy          | `number`      | The Y offset of the shadow.                                   |
| blur        | `number`      | The blur radius for the shadow                                |
| color       | `Color`       | The color of the drop shadow                                  |
| inner?      | `boolean`     | Shadows are drawn within the input content                    |
| shadowOnly? | `boolean`     | If true, the result does not include the input content        | 
| children?   | `ImageFilter` | Optional image filter to be applied first                     |

## Drop Shadow

The example below creates two drop shadows.
It is equivalent to the following CSS notation.

```css
.paint {
  filter: drop-shadow(12px 12px 25px #93b8c4) drop-shadow(-12px -12px 25px #c7f8ff);
}
```

```tsx twoslash
import {
  Shadow,
  Fill,
  RoundedRect,
  Canvas
} from "@shopify/react-native-skia";

const Neumorphism = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill color="lightblue" />
      <RoundedRect x={32} y={32} width={192} height={192} r={32} color="lightblue">
        <Shadow dx={12} dy={12} blur={25} color="#93b8c4" />
        <Shadow dx={-12} dy={-12} blur={25} color="#c7f8ff" />
      </RoundedRect>
    </Canvas>
  );
};
```

### Result

<img src={require("/static/img/image-filters/dropshadow.png").default} width="256" height="256" />

## Inner Shadow

```tsx twoslash
import {
  Shadow,
  Fill,
  RoundedRect,
  Canvas
} from "@shopify/react-native-skia";

const Neumorphism = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill color="lightblue" />
      <RoundedRect x={32} y={32} width={192} height={192} r={32} color="lightblue">
        <Shadow dx={12} dy={12} blur={25} color="#93b8c4" inner />
        <Shadow dx={-12} dy={-12} blur={25} color="#c7f8ff" inner />
      </RoundedRect>
    </Canvas>
  );
};
```

### Result

<img src={require("/static/img/image-filters/innershadow.png").default} width="256" height="256" />



---

## Paint

Anytime you draw something in Skia, you want to specify what color it is, how it blends with the background, or what style to draw it in.
We call these painting attributes.
And in React Native Skia, these attributes can be specified as properties or as children of a drawing component (`<Rect />`, or `<Circle />` for instance) or a `<Group />`.
There is also a `<Paint />` component which can be assigned directly to a drawing or group via its reference.

The following painting attributes can be assigned as properties:
* [color](properties.md#color)            
* [blendMode](properties.md#blendmode)     
* [style](properties.md#style)             
* [strokeWidth](properties.md#strokewidth) 
* [strokeJoin](properties.md#strokejoin)   
* [strokeCap](properties.md#strokecap)     
* [strokeMiter](properties.md#strokemiter) 
* [opacity](properties.md#opacity)
* [antiAlias](properties.md#antialias)            

The following painting attributes can be assigned as children:
* [Shaders](/docs/shaders/overview) 
* [Image Filters](/docs/image-filters/overview)
* [Color Filters](/docs/color-filters)
* [Mask Filters](/docs/mask-filters)
* [Path Effects](/docs/path-effects)

## Fills and Strokes

In Skia, a paint has a style property to indicate whether it is a fill or a stroke paint.
When drawing something, you can pass Paint components as children to add strokes and fills.
In the example below, the circle has one light blue fill and two stroke paints.

```tsx twoslash
import {Canvas, Circle, Paint, vec} from "@shopify/react-native-skia";

const width = 256;
const height = 256;

export const PaintDemo = () => {
  const strokeWidth = 10;
  const c = vec(width / 2, height / 2);
  const r = (width - strokeWidth) / 2;
  return (
    <Canvas style={{ width, height}}>
       <Circle c={c} r={r} color="red">
        <Paint color="lightblue" />
        <Paint color="#adbce6" style="stroke" strokeWidth={strokeWidth} />
        <Paint color="#ade6d8" style="stroke" strokeWidth={strokeWidth / 2} />
      </Circle>
    </Canvas>
  );
};
```

<img alt="Paint Fill and strokes" src={require("/static/img/paint/stroke.png").default} width="256" height="256" />

## Inheritance

Descendants inherit the paint attributes.
In the example below, the first circle will be filled with a light blue color, and the second circle will have a light blue stroke.  

```tsx twoslash
import {Canvas, Circle, Paint, Group} from "@shopify/react-native-skia";

const width = 256;
const height = 256;

export const PaintDemo = () => {
  const r = width / 6;
  return (
    <Canvas style={{ width, height }}>
      <Group color="lightblue">
        <Circle cx={r} cy={r} r={r} />
        <Group style="stroke" strokeWidth={10}>
          <Circle cx={3 * r} cy={3 * r} r={r} />
        </Group>
      </Group>
    </Canvas>
  );
};
```

<img alt="Paint Inheritance" src={require("/static/img/paint/inheritance.png").default} width="256" height="256" />


Complex painting attributes like a shader or an image filter can be passed as children to a group or a drawing.

```tsx twoslash
import {Canvas, Circle, Group, LinearGradient, vec} from "@shopify/react-native-skia";

const width = 256;
const height = 256;

export const PaintDemo = () => {
  const r = width/2;
  return (
    <Canvas style={{ width, height }}>
      <Circle cx={r} cy={r} r={r}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(2 * r, 2 * r)}
          colors={["#00ff87", "#60efff"]}
        />
      </Circle>
      <Group>
        <LinearGradient
          start={vec(2 * r, 2 * r)}
          end={vec(4 * r, 4 * r)}
          colors={["#0061ff", "#60efff"]}
        />
        <Circle cx={3 * r} cy={3 * r} r={r} />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/paint/complex-paint.png").default} width="256" height="256" />


## Manual Paint Assignment

Finally, we can assign a ref to a Paint component for later use.

```tsx twoslash
import {Canvas, Circle, Paint, Skia} from "@shopify/react-native-skia";
const width = 256;
const height = 256;
const r = width / 2;
const paint = Skia.Paint();
paint.setColor(Skia.Color("lightblue"));

export const PaintDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle paint={paint} cx={r} cy={r} r={r} />
    </Canvas>
  );
};
```

<img src={require("/static/img/paint/assignement.png").default} width="256" height="256" />


Below are the properties of a Paint component.
The following children can also be assigned to a Paint:
* [Shaders](/docs/shaders/overview)
* [Image Filters](/docs/image-filters/overview)
* [Color Filters](/docs/color-filters)
* [Mask Filters](/docs/mask-filters)
* [Path Effects](/docs/path-effects)

## color

Sets the alpha and RGB used when stroking and filling.
The color is a string or a number.
Any valid [CSS color](https://www.w3.org/TR/css-color-3/) value is supported. 

```tsx twoslash
import {Group, Circle, vec} from "@shopify/react-native-skia";

<>
  <Group color="red">
    <Circle c={vec(0, 0)} r={100} />
  </Group>
  {/* 0xffff0000 is also red (format is argb) */}
  <Group color={0xffff0000}>
    <Circle c={vec(0, 0)} r={50} />
  </Group>
  {/* Any CSS color is valid */}
  <Group color="hsl(120, 100%, 50%)">
    <Circle c={vec(0, 0)} r={50} />
  </Group>
</>
```

## opacity

Replaces alpha, leaving RGBA unchanged. 0 means fully transparent, 1.0 means opaque.
When setting opacity in a Group component, the alpha component of all descending colors will inherit that value.

```tsx twoslash
import {Canvas, Circle, Group, Paint, vec} from "@shopify/react-native-skia";

const width = 256;
const height = 256;
const strokeWidth = 30;
const r = width / 2 - strokeWidth / 2;
const c = vec(width / 2, height / 2);

export const OpacityDemo = () => {
  return (
    <Canvas style={{ width, height }}>
      <Group opacity={0.5}>
        <Circle c={c} r={r} color="red" />
        <Circle
          c={c}
          r={r}
          color="lightblue"
          style="stroke"
          strokeWidth={strokeWidth}
        />
        <Circle
          c={c}
          r={r}
          color="mint"
          style="stroke"
          strokeWidth={strokeWidth / 2}
        />
      </Group>
    </Canvas>
  );
};
```

<img alt="Paint Opacity" src={require("/static/img/paint/opacity.png").default} width="256" height="256" />

## blendMode

Sets the blend mode that is, the mode used to combine source color with destination color.
The following values are available: `clear`, `src`, `dst`, `srcOver`, `dstOver`, `srcIn`, `dstIn`, `srcOut`, `dstOut`,
`srcATop`, `dstATop`, `xor`, `plus`, `modulate`, `screen`, `overlay`, `darken`, `lighten`, `colorDodge`, `colorBurn`, `hardLight`,
`softLight`, `difference`, `exclusion`, `multiply`, `hue`, `saturation`, `color`, `luminosity`, `plusDarker`, and `plusLighter`.

## style

The paint style can be `fill` (default) or `stroke`.

## strokeWidth

Thickness of the pen used to outline the shape.

## strokeJoin

Sets the geometry drawn at the corners of strokes.
Values can be `bevel`, `miter`, or `round`.

## strokeCap

Returns the geometry drawn at the beginning and end of strokes.
Values can be `butt`, `round`, or `square`.

## strokeMiter

Limit at which a sharp corner is drawn beveled.

## antiAlias

Requests, but does not require, that edge pixels draw opaque or with partial transparency.

## dither

Requests, but does not require, to distribute color error.


---

## Shaders

## Blend Shader

Returns a shader that combines the given shaders with a BlendMode.

| Name        | Type           |  Description                    |
|:------------|:---------------|:--------------------------------|
| mode        | `BlendMode` | see [blend modes](paint/properties.md#blendmode). |
| children    | `ReactNode` | Shaders to blend |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Rect,
  Turbulence,
  Skia,
  Shader,
  Fill,
  RadialGradient,
  Blend,
  vec
} from "@shopify/react-native-skia";

export const BlendDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={256} height={256}>
        <Blend mode="difference">
          <RadialGradient
            r={128}
            c={vec(128, 128)}
            colors={["blue", "yellow"]}
          />
          <Turbulence freqX={0.05} freqY={0.05} octaves={4} />
        </Blend>
      </Rect>
    </Canvas>
  );
};
```
### Result
![Blend](assets/blend.png)

## Color Shader

Returns a shader with a given color.

| Name        | Type           |  Description                    |
|:------------|:---------------|:--------------------------------|
| color       | `string`       | Color                           |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Skia,
  Fill,
  ColorShader
} from "@shopify/react-native-skia";

export const BlendDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill>
        <ColorShader color="lightBlue" />
      </Fill>
    </Canvas>
  );
};
```
### Result
<img src={require("/static/img/shaders/color.png").default} width="256" height="256" />



## Common Properties

Below are the properties common to all gradient components.

| Name       | Type           |  Description                    |
|:-----------|:---------------|:--------------------------------|
| colors     | `string[]`     | Colors to be distributed between start and end. |
| positions? | `number[]`     | The relative positions of colors. If supplied, it must be of the same length as colors. |
| mode?      | `TileMode`     | Can be `clamp`, `repeat`, `mirror`, or `decal`. |
| flags?     | `number`       | By default, gradients will interpolate their colors in unpremultiplied space and then premultiply each of the results. By setting this to 1, the gradients will premultiply their colors first and then interpolate between them. |
| transform? | `Transforms2d` | see [transformations](/docs/group#transformations). |

## Linear Gradient

Returns a shader that generates a linear gradient between the two specified points.

| Name       | Type           |  Description                    |
|:-----------|:---------------|:--------------------------------|
| start      | `Point`        | Start position of the gradient. |
| end        | `Point`        | End position of the gradient.   |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Rect,
  LinearGradient,
  Skia,
  Shader,
  vec
} from "@shopify/react-native-skia";

export const LinearGradientDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={256} height={256}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(256, 256)}
          colors={["blue", "yellow"]}
        />
      </Rect>
    </Canvas>
  );
};
```
### Result
![Linear Gradient](assets/linear-gradient.png)

## Radial Gradient

Returns a shader that generates a radial gradient given the center and radius.

| Name       | Type           |  Description                    |
|:-----------|:---------------|:--------------------------------|
| c          | `Point`        | Center of the gradient. |
| r          | `number`       | Radius of the gradient.   |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Rect,
  RadialGradient,
  Skia,
  Shader,
  vec
} from "@shopify/react-native-skia";

export const RadialGradientDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={256} height={256}>
        <RadialGradient
          c={vec(128, 128)}
          r={128}
          colors={["blue", "yellow"]}
        />
      </Rect>
    </Canvas>
  );
};
```
### Result
![Radial Gradient](assets/radial-gradient.png)

## Two Point Conical Gradient

Returns a shader that generates a conical gradient given two circles.

| Name       | Type           |  Description                    |
|:-----------|:---------------|:--------------------------------|
| start  | `Point`        | Center of the start circle. |
| startR | `number`       | Radius of the start circle. |
| end    | `number`       | Center of the end circle.   |
| endR          | `number`       | Radius of the end circle.   |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Rect,
  TwoPointConicalGradient,
  Skia,
  Shader,
  vec
} from "@shopify/react-native-skia";

export const TwoPointConicalGradientDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={256} height={256}>
        <TwoPointConicalGradient
          start={vec(128, 128)}
          startR={128}
          end={vec(128, 16)}
          endR={16}
          colors={["blue", "yellow"]}
        />
      </Rect>
    </Canvas>
  );
};
```
### Result
![Two Point Conical Gradient](assets/two-point-conical-gradient.png)

## Sweep Gradient

Returns a shader that generates a sweep gradient given a center.

| Name       | Type           |  Description                    |
|:-----------|:---------------|:--------------------------------|
| c          | `Point`        | Center of the gradient          |
| start?     | `number`       | Start angle in degrees (default is 0). |
| end?     | `number`         | End angle in degrees (default is 360). |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Rect,
  SweepGradient,
  Skia,
  Shader,
  vec
} from "@shopify/react-native-skia";

export const SweepGradientDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={256} height={256}>
        <SweepGradient
          c={vec(128, 128)}
          colors={["cyan", "magenta", "yellow", "cyan"]}
        />
      </Rect>
    </Canvas>
  );
};
```
### Result
![Sweep Gradient](assets/sweep-gradient.png)


## Image

Returns an image as a shader with the specified tiling.
It will use cubic sampling.

| Name       | Type           |  Description                       |
|:-----------|:---------------|:-----------------------------------|
| image      | `SkImage`      | Image instance. |
| tx?        | `TileMode`     | Can be `clamp`, `repeat`, `mirror`, or `decal`. |
| ty?        | `TileMode`     | Can be `clamp`, `repeat`, `mirror`, or `decal`. |
| fit?       | `Fit`          | Calculate the transformation matrix to fit the rectangle defined by `fitRect`. See [images](/docs/images). |
| rect?      | `SkRect`       | The destination rectangle to calculate the transformation matrix via the `fit` property. |
| transform? | `Transforms2d` | see [transformations](/docs/group#transformations). |
| sampling? | `Sampling` | The method used to sample the image. see ([sampling options](/docs/images#sampling-options)). |

### Example
```tsx twoslash
import {
  Canvas,
  Circle,
  ImageShader,
  Skia,
  Shader,
  useImage
} from "@shopify/react-native-skia";

const ImageShaderDemo = () => {
  const image = useImage(require("../../assets/oslo.jpg"));
  if (image === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={128} cy={128} r={128}>
        <ImageShader
          image={image}
          fit="cover"
          rect={{ x: 0, y: 0, width: 256, height: 256 }}
        />
      </Circle>
    </Canvas>
  );
};
```
### Result
![Image Shader](assets/image.png)


Skia provides a shading language.
You can play with it [here](https://shaders.skia.org/).
The syntax is very similar to GLSL.
If you're already familiar with GLSL, or are looking to convert a GLSL shader to SKSL, you can view a list of their differences [here](https://github.com/google/skia/tree/main/src/sksl#readme).

The first step is to create a shader and compile it using `RuntimeEffect.Make`.

```tsx twoslash
import {Skia} from "@shopify/react-native-skia";

const source = Skia.RuntimeEffect.Make(`
vec4 main(vec2 pos) {
  // The canvas is 256x256
  vec2 canvas = vec2(256);
  // normalized x,y values go from 0 to 1
  vec2 normalized = pos/canvas;
  return vec4(normalized.x, normalized.y, 0.5, 1);
}`);

if (!source) {
  throw new Error("Couldn't compile the shader")
}
```

## Shader

Creates a shader from source.
Shaders can be nested with one another.

| Name     | Type                                                                                                    |  Description                  |
|:---------|:--------------------------------------------------------------------------------------------------------|:------------------------------|
| source   | `RuntimeEffect`                                                                                         | Compiled shaders              |
| uniforms | `{ [name: string]: number &#124; Vector &#124; Vector[] &#124; number[] &#124; number[][] }` | uniform values                |
| children | `Shader`                                                                                                | Shaders to be used as uniform |

### Simple Shader

```tsx twoslash
import {Skia, Canvas, Shader, Fill} from "@shopify/react-native-skia";

const source = Skia.RuntimeEffect.Make(`
vec4 main(vec2 pos) {
  // normalized x,y values go from 0 to 1, the canvas is 256x256
  vec2 normalized = pos/vec2(256);
  return vec4(normalized.x, normalized.y, 0.5, 1);
}`)!;

const SimpleShader = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill>
        <Shader source={source} />
      </Fill>
    </Canvas>
  );
};
```

![Simple Shader](assets/simple.png)

### Using Uniforms

Uniforms are variables used to parametrize shaders.
The following uniform types are supported: `float`, `float2`, `float3`, `float4`, `float2x2`, `float3x3`, `float4x4`, `int`, `int2`, `int3` and, `int4`.
The types can also be used as arrays, e.g. `uniform float3 colors[12]`. 

```tsx twoslash
import {Canvas, Skia, Shader, Fill, vec} from "@shopify/react-native-skia";

const source = Skia.RuntimeEffect.Make(`
uniform vec2 c;
uniform float r;
uniform float blue;

vec4 main(vec2 pos) {
  vec2 normalized = pos/vec2(2 * r);
  return distance(pos, c) > r ? vec4(1) : vec4(normalized, blue, 1);
}`)!;

const UniformShader = () => {
  const r = 128;
  const c = vec(2 * r, r);
  const blue = 1.0;
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill>
        <Shader source={source} uniforms={{ c, r, blue }} />
      </Fill>
    </Canvas>
  );
};
```

![Simple Shader](assets/simple-uniform.png)

### Nested Shaders

```tsx twoslash
import {Canvas, Skia, ImageShader, Shader, Fill, useImage} from "@shopify/react-native-skia";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;

half4 main(float2 xy) {   
  xy.x += sin(xy.y / 3) * 4;
  return image.eval(xy).rbga;
}`)!;

const NestedShader = () => {
  const image = useImage(require("./assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill>
        <Shader source={source}>
          <ImageShader
            image={image}
            fit="cover"
            rect={{ x: 0, y: 0, width: 256, height: 256 }}
          />
        </Shader>
      </Fill>
    </Canvas>
  );
};
```

![Simple Shader](assets/nested.png)


## Fractal Perlin Noise Shader

Returns a shader with Perlin Fractal Noise.

| Name        | Type           |  Description                    |
|:------------|:---------------|:--------------------------------|
| freqX       | `number` | base frequency in the X direction; range [0.0, 1.0]|
| freqY       | `number` | base frequency in the Y direction; range [0.0, 1.0] |
| octaves     | `number`         |  |
| seed        | `number`     | |
| tileWidth?  | `number`     | if this and `tileHeight` are non-zero, the frequencies will be modified so that the noise will be tileable for the given size. |
| tileHeight? | `number`       | if this and `tileWidth` are non-zero, the frequencies will be modified so that the noise will be tileable for the given size. |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Rect,
  FractalNoise,
  Skia,
  Shader,
  Fill,
  vec
} from "@shopify/react-native-skia";

export const FractalNoiseDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />
      <Rect x={0} y={0} width={256} height={256}>
        <FractalNoise freqX={0.05} freqY={0.05} octaves={4} />
      </Rect>
    </Canvas>
  );
};
```
### Result
![Fractal](assets/fractal.png)

## Turbulence Perlin Noise Shader

Returns a shader with Perlin Turbulence.

| Name        | Type           |  Description                    |
|:------------|:---------------|:--------------------------------|
| freqX       | `number` | base frequency in the X direction; range [0.0, 1.0]|
| freqY       | `number` | base frequency in the Y direction; range [0.0, 1.0] |
| octaves     | `number`         |  |
| seed        | `number`     | |
| tileWidth?  | `number`     | if this and `tileHeight` are non-zero, the frequencies will be modified so that the noise will be tileable for the given size. |
| tileHeight? | `number`       | if this and `tileWidth` are non-zero, the frequencies will be modified so that the noise will be tileable for the given size. |

### Example
```tsx twoslash
import React from "react";
import {
  Canvas,
  Rect,
  Turbulence,
  Skia,
  Shader,
  Fill,
  vec
} from "@shopify/react-native-skia";

export const TurbulenceDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />
      <Rect x={0} y={0} width={256} height={256}>
        <Turbulence freqX={0.05} freqY={0.05} octaves={4} />
      </Rect>
    </Canvas>
  );
};
```
### Result
![Turbulence](assets/turbulence.png)



---

## Shapes

The Atlas component is used for efficient rendering of multiple instances of the same texture or image. It is especially useful for drawing a very large number of similar objects, like sprites, with varying transformations.

Its design particularly useful when using with [Reanimated](#animations).

| Name    | Type             |  Description     |
|:--------|:-----------------|:-----------------|
| image   | `SkImage or null` | Atlas: image containing the sprites. |
| sprites | `SkRect[]` | locations of sprites in atlas.             |
| transforms | `RSXform[]` | Rotation/scale transforms to be applied for each sprite. |
| colors? | `SkColor[]` | Optional. Color to blend the sprites with. |
| blendMode? | `BlendMode` | Optional. Blend mode used to combine sprites and colors together. |
| sampling? | `Sampling` | The method used to sample the image. see ([sampling options](/docs/images#sampling-options)). |

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

```tsx
import {Skia, drawAsImage, Group, Rect, Canvas, Atlas, rect} from "@shopify/react-native-skia";

const size = { width: 25, height: 11.25 };
const strokeWidth = 2;
const imageSize = {
    width: size.width + strokeWidth,
    height: size.height + strokeWidth,
};
const image = await drawAsImage(
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


import useBaseUrl from '@docusaurus/useBaseUrl';


In React Native Skia, a box is a rectangle or a rounded rectangle.
Currently it can be used to provide a fast inner shadow primitive.
It may have some other features in the future.

| Name       | Type     |  Description                                       |
|:-----------|:---------|:---------------------------------------------------|
| box        | `SkRect` or `SkRRect` | Rounded rectangle to draw             |
| children?  | `BoxShadow` | Bounding rectangle of the drawing after scale   |

The `Box` component accepts `BoxShadow` components as children.

| Name    | Type      |  Description                                           |
|:--------|:----------|:-------------------------------------------------------|
| dx?     | `number`  | The X offset of the shadow.                            |
| dy?     | `number`  | The Y offset of the shadow.                            |
| blur    | `number`  | The blur radius for the shadow                         |
| color   | `Color`   | The color of the drop shadow                           |
| inner?  | `boolean` | Shadows are drawn within the input content             |
| spread? | `number`  | If true, the result does not include the input content | 


## Example

```tsx twoslash
import {Canvas, Box, BoxShadow, Fill, rrect, rect} from "@shopify/react-native-skia";

export const Demo = () => (
  <Canvas style={{ width: 256, height: 256 }}>
    <Fill color="#add8e6" />
    <Box box={rrect(rect(64, 64, 128, 128), 24, 24)} color="#add8e6">
      <BoxShadow dx={10} dy={10} blur={10} color="#93b8c4" inner />
      <BoxShadow dx={-10} dy={-10} blur={10} color="#c7f8ff" inner />
      <BoxShadow dx={10} dy={10} blur={10} color="#93b8c4" />
      <BoxShadow dx={-10} dy={-10} blur={10} color="#c7f8ff" />
    </Box>
  </Canvas>
);
```

### Result

<img src={require("/static/img/box/box-shadow.png").default} width="256" height="256" />


## Circle

Draws a circle.

| Name | Type     |  Description     |
|:-----|:---------|:-----------------|
| cx   | `number` | Start point.     |
| cy   | `number` | End point.       |
| r    | `number` | Radius.          |

```tsx twoslash
import {Canvas, Circle} from "@shopify/react-native-skia";

const CircleDemo = () => {
  const r = 128;
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={r} cy={r} r={r} color="lightblue" />
    </Canvas>
  );
};
```

![Circle](assets/ellipses/circle.png)


## Oval

Draws an oval based on its bounding rectangle.

| Name   | Type     |  Description                                |
|:-------|:---------|:--------------------------------------------|
| x      | `number` | X coordinate of the bounding rectangle.     |
| y      | `number` | Y coordinate of the bounding rectangle.     |
| width  | `number` | Width of the bounding rectangle.            |
| height | `number` | Height of the bounding rectangle.           |



```tsx twoslash
import {Canvas, Oval} from "@shopify/react-native-skia";

const OvalDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Oval x={64} y={0} width={128} height={256} color="lightblue" />
    </Canvas>
  );
};
```

![Oval](assets/ellipses/oval.png)


Draws a [Coons patch](https://en.wikipedia.org/wiki/Coons_patch).

| Name      | Type      |  Description                                                  |
|:----------|:----------|:--------------------------------------------------------------|
| cubics | `CubicBezier[4]` | Specifies four cubic Bezier starting at the top-left corner, in clockwise order, sharing every fourth point. The last cubic Bezier ends at the first point. |
| textures   | `Point[]`   | [Texture mapping](https://en.wikipedia.org/wiki/Texture_mapping). The texture is the shader provided by the paint |
| colors?    | `string[]`   | Optional colors to be associated to each corner |
| blendMode? | `BlendMode`  | If `colors` is provided, colors are blended with the paint using the blend mode. Default is `dstOver` if colors are provided, `srcOver` if not |

## Example

```tsx twoslash
import {Canvas, Patch, vec} from "@shopify/react-native-skia";

const PatchDemo = () => {
  const colors = ["#61dafb", "#fb61da", "#61fbcf", "#dafb61"];
  const C = 64;
  const width = 256;
  const topLeft = { pos: vec(0, 0), c1: vec(0, C), c2: vec(C, 0) };
  const topRight = {
    pos: vec(width, 0),
    c1: vec(width, C),
    c2: vec(width + C, 0),
  };
  const bottomRight = {
    pos: vec(width, width),
    c1: vec(width, width - 2 * C),
    c2: vec(width - 2 * C, width),
  };
  const bottomLeft = {
    pos: vec(0, width),
    c1: vec(0, width - 2 * C),
    c2: vec(-2 * C, width),
  };
  return (
    <Canvas style={{ flex: 1 }}>
      <Patch
        colors={colors}
        patch={[topLeft, topRight, bottomRight, bottomLeft]}
      />
    </Canvas>
  );
};
```

![SVG Notation](assets/patch/example1.png)

In Skia, paths are semantically identical to [SVG Paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths).

| Name      | Type      |  Description                                                  |
|:----------|:----------|:--------------------------------------------------------------|
| path      | `SkPath` or `string` | Path to draw. Can be a string using the [SVG Path notation](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands) or an object created with `Skia.Path.Make()`. |
| start     | `number` | Trims the start of the path. Value is in the range `[0, 1]` (default is 0). |
| end       | `number` | Trims the end of the path. Value is in the range `[0, 1]` (default is 1). |
| stroke    | `StrokeOptions` | Turns this path into the filled equivalent of the stroked path. This will fail if the path is a hairline. `StrokeOptions` describes how the stroked path should look. It contains three properties: `width`, `strokeMiterLimit` and, `precision` |

React Native Skia also provides [Path Effects](/docs/path-effects) and [Path hooks](/docs/animations/hooks) for animations.

### Using SVG Notation

```tsx twoslash
import {Canvas, Path} from "@shopify/react-native-skia";

const SVGNotation = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path
        path="M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
        color="lightblue"
      />
    </Canvas>
  );
};
```

![SVG Notation](assets/path/svg.png)

### Using Path Object

```tsx twoslash
import {Canvas, Path, Skia} from "@shopify/react-native-skia";

const path = Skia.Path.Make();
path.moveTo(128, 0);
path.lineTo(168, 80);
path.lineTo(256, 93);
path.lineTo(192, 155);
path.lineTo(207, 244);
path.lineTo(128, 202);
path.lineTo(49, 244);
path.lineTo(64, 155);
path.lineTo(0, 93);
path.lineTo(88, 80);
path.lineTo(128, 0);
path.close();

const PathDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path
        path={path}
        color="lightblue"
      />
    </Canvas>
  );
};
```

![Path Object](assets/path/path-object.png)

### Trim

```tsx twoslash
import {Canvas, Path} from "@shopify/react-native-skia";

const SVGNotation = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path
        path="M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
        color="lightblue"
        style="stroke"
        strokeJoin="round"
        strokeWidth={5}
        // We trim the first and last quarter of the path
        start={0.25}
        end={0.75}
      />
    </Canvas>
  );
};
```

![Trim](assets/path/trim.png)


## Fill Type

The `fillType` property defines the algorithm to use to determine the inside part of a shape.
Possible values are: `winding`, `evenOdd`, `inverseWinding`, `inverseEvenOdd`. Default value is `winding`.

```tsx twoslash
import {Canvas, Skia, Fill, Path} from "@shopify/react-native-skia";

const star = () => {
  const R = 115.2;
  const C = 128.0;
  const path = Skia.Path.Make();
  path.moveTo(C + R, C);
  for (let i = 1; i < 8; ++i) {
    const a = 2.6927937 * i;
    path.lineTo(C + R * Math.cos(a), C + R * Math.sin(a));
  }
  return path;
};

export const HelloWorld = () => {
  const path = star();
  return (
    <Canvas style={{ flex: 1 }}>  
      <Fill color="white" />
      <Path path={path} style="stroke" strokeWidth={4} color="#3EB489"/>
      <Path path={path} color="lightblue" fillType="evenOdd" />
    </Canvas>
  );
};
```

<img src={require("/static/img/paths/evenodd-filltype.png").default} width="256" height="256" />


## Rect

Draws a rectangle.

| Name   | Type     | Description              |
| :----- | :------- | :----------------------- |
| x      | `number` | X coordinate.            |
| y      | `number` | Y coordinate.            |
| width  | `number` | Width of the rectangle.  |
| height | `number` | Height of the rectangle. |

```tsx twoslash
import { Canvas, Rect } from "@shopify/react-native-skia";

const RectDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={256} height={256} color="lightblue" />
    </Canvas>
  );
};
```

## RoundedRect

Draws a rounded rectangle.

| Name   | Type     | Description                                                   |
| :----- | :------- | :------------------------------------------------------------ |
| x      | `number` | X coordinate.                                                 |
| y      | `number` | Y coordinate.                                                 |
| width  | `number` | Width of the rectangle.                                       |
| height | `number` | Height of the rectangle.                                      |
| r?    | `number` or `Vector` | Corner radius. Defaults to `ry` if specified or 0. |

```tsx twoslash
import { Canvas, RoundedRect } from "@shopify/react-native-skia";

const RectDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <RoundedRect
        x={0}
        y={0}
        width={256}
        height={256}
        r={25}
        color="lightblue"
      />
    </Canvas>
  );
};
```

<img src={require("/static/img/rrect/uniform.png").default} width="256" height="256" />

### Using Custom Radii

You can set a different corner radius for each corner.

```tsx twoslash
import { Canvas, RoundedRect } from "@shopify/react-native-skia";

const RectDemo = () => {
  const size = 256;
  const r = size * 0.2;
  const rrct = {
    rect: { x: 0, y: 0, width: size, height: size },
    topLeft: { x: 0, y: 0 },
    topRight: { x: r, y: r },
    bottomRight: { x: 0, y: 0 },
    bottomLeft: { x: r, y: r },
  };
  return (
    <Canvas style={{ width: size, height: size }}>
      <RoundedRect
        rect={rrct}
        color="lightblue"
      />
    </Canvas>
  );
};
```

<img src={require("/static/img/rrect/nonuniform.png").default} width="256" height="256" />

## DiffRect

Draws the difference between two rectangles.

| Name  | Type          | Description      |
| :---- | :------------ | :--------------- |
| outer | `RectOrRRect` | Outer rectangle. |
| inner | `RectOrRRect` | Inner rectangle. |

```tsx twoslash
import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";

const DRectDemo = () => {
  const outer = rrect(rect(0, 0, 256, 256), 25, 25);
  const inner = rrect(rect(50, 50, 256 - 100, 256 - 100), 50, 50);
  return (
    <Canvas style={{ flex: 1 }}>
      <DiffRect inner={inner} outer={outer} color="lightblue" />
    </Canvas>
  );
};
```

<img src={require("/static/img/shapes/drect.png").default} width="256" height="256" />

## Line

Draws a line between two points.

| Name | Type    | Description  |
| :--- | :------ | :----------- |
| p1   | `Point` | Start point. |
| p2   | `Point` | End point.   |

```tsx twoslash
import { Canvas, Line, vec } from "@shopify/react-native-skia";

const LineDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Line
        p1={vec(0, 0)}
        p2={vec(256, 256)}
        color="lightblue"
        style="stroke"
        strokeWidth={4}
      />
    </Canvas>
  );
};
```

![Line](assets/polygons/line.png)

## Points

Draws points and optionally draws the connection between them.

| Name   | Type        | Description                                                                                                                                                |
| :----- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| points | `Point`     | Points to draw.                                                                                                                                            |
| mode   | `PointMode` | How should the points be connected. Can be `points` (no connection), `lines` (connect pairs of points), or `polygon` (connect lines). Default is `points`. |

```tsx twoslash
import { Canvas, Points, vec } from "@shopify/react-native-skia";

const PointsDemo = () => {
  const points = [
    vec(128, 0),
    vec(168, 80),
    vec(256, 93),
    vec(192, 155),
    vec(207, 244),
    vec(128, 202),
    vec(49, 244),
    vec(64, 155),
    vec(0, 93),
    vec(88, 80),
    vec(128, 0),
  ];
  return (
    <Canvas style={{ flex: 1 }}>
      <Points
        points={points}
        mode="polygon"
        color="lightblue"
        style="stroke"
        strokeWidth={4}
      />
    </Canvas>
  );
};
```

![Point](assets/polygons/points.png)


Draws vertices.

| Name       | Type         | Description              |
| :--------- | :----------- | :----------------------- |
| vertices   | `Point[]`    | Vertices to draw |
| mode?      | `VertexMode` | Can be `triangles`, `triangleStrip` or `triangleFan`. Default is `triangles` |
| indices?   | `number[]`   | Indices of the vertices that form the triangles. If not provided, the order of the vertices will be taken. Using this property enables you not to duplicate vertices. |
| textures   | `Point[]`   | [Texture mapping](https://en.wikipedia.org/wiki/Texture_mapping). The texture is the shader provided by the paint. |
| colors?    | `string[]`   | Optional colors to be associated to each vertex |
| blendMode? | `BlendMode`  | If `colors` is provided, colors are blended with the paint using the blend mode. Default is `dstOver` if colors are provided, `srcOver` if not. |

## Using texture mapping

```tsx twoslash
import { Canvas, Group, ImageShader, Vertices, vec, useImage } from "@shopify/react-native-skia";

const VerticesDemo = () => {
  const image = useImage(require("./assets/squares.png"));
  const vertices = [vec(64, 0), vec(128, 256), vec(0, 256)];
  const colors = ["#61dafb", "#fb61da", "#dafb61"];
  const textures = [vec(0, 0), vec(0, 128), vec(64, 256)];
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      {/* This is our texture */}
      <Group>
        <ImageShader
          image={image}
          tx="repeat"
          ty="repeat"
        />
        {/* Here we specified colors, the default blendMode is dstOver */}
        <Vertices vertices={vertices} colors={colors} />
        <Group transform={[{ translateX: 128 }]}>
          {/* Here we didn't specify colors, the default blendMode is srcOver */}
          <Vertices vertices={vertices} textures={textures} />
        </Group>
      </Group>
    </Canvas>
  );
};
```

![Texture Mapping](assets/vertices/textureMapping.png)

## Using indices

In the example below, we defined four vertices, representing four corners of a rectangle.
Then we use the indices property to define the two triangles we would like to draw based on these four vertices.
* First triangle: `0, 1, 2` (top-left, top-right, bottom-right).
* Second triangle: `0, 2, 3` (top-left, bottom-right, bottom-left).

```tsx twoslash
import { Canvas, Vertices, vec } from "@shopify/react-native-skia";

const IndicesDemo = () => {
  const vertices = [vec(0, 0), vec(256, 0), vec(256, 256), vec(0, 256)];
  const colors = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf"];
  const triangle1 = [0, 1, 2];
  const triangle2 = [0, 2, 3];
  const indices = [...triangle1, ...triangle2];
  return (
    <Canvas style={{ flex: 1 }}>
      <Vertices vertices={vertices} colors={colors} indices={indices} />
    </Canvas>
  );
};
```

![Indices](assets/vertices/indices.png)



---

## Text

A text blob contains glyphs, positions, and paint attributes specific to the text.

| Name        | Type       |  Description                                                 |
|:------------|:-----------|:-------------------------------------------------------------|
| blob        | `TextBlob` | Text blob                                                    |
| x?          | `number`   | x coordinate of the origin of the entire run. Default is 0   |
| y?          | `number`   | y coordinate of the origin of the entire run. Default is 0   |

## Example

```tsx twoslash
import {Canvas, TextBlob, Skia, useFont} from "@shopify/react-native-skia";


export const HelloWorld = () => {
  const font = useFont(require("./SF-Pro.ttf"), 24);
  if (font === null) {
    return null;
  }
  const blob = Skia.TextBlob.MakeFromText("Hello World!", font);
  return (
      <Canvas style={{ flex: 1 }}>
        <TextBlob
          blob={blob}
          color="blue"
        />
      </Canvas>
  );
};
```

This component draws a run of glyphs, at corresponding positions, in a given font.

| Name        | Type       |  Description                                                           |
|:------------|:-----------|:-----------------------------------------------------------------------|
| glyphs      | `Glyph[]`  | Glyphs to draw                                                         |
| x?          | `number`  | x coordinate of the origin of the entire run. Default is 0             |
| y?          | `number`  | y coordinate of the origin of the entire run. Default is 0             |
| font        | `SkFont`     | Font to use                                                          |

## Draw text vertically

```tsx twoslash
import {Canvas, Glyphs, vec, useFont} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const fontSize = 32;
  const font = useFont(require("./my-font.otf"), fontSize);
  if (font === null) {
    return null;
  }
  const glyphs = font
    .getGlyphIDs("Hello World!")
    .map((id, i) => ({ id, pos: vec(0, (i + 1) * fontSize) }));
  return (
    <Canvas style={{ flex:  1 }}>
      <Glyphs
        font={font}
        glyphs={glyphs}
      />
    </Canvas>
  );
}
```

<img src={require("/static/img/text/hello-world-vertical.png").default} width="256" height="256" />


React Native Skia offers an API to perform text layouts using the Skia Paragraph API.

## Hello World

In the example below, we create a simple paragraph based on custom fonts.
The emojis will be renderer using the emoji font available on the platform.
Other system fonts are available as well.

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts, TextAlign, Canvas } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const customFontMgr = useFonts({
    Roboto: [
      require("path/to/Roboto-Regular.ttf"),
      require("path/to/Roboto-Medium.ttf")
    ]
  });

  const paragraph = useMemo(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const paragraphStyle = {
      textAlign: TextAlign.Center
    };
    const textStyle = {
      color: Skia.Color("black"),
      fontFamilies: ["Roboto"],
      fontSize: 50,
    };
    return Skia.ParagraphBuilder.Make(paragraphStyle, customFontMgr)
      .pushStyle(textStyle)
      .addText("Say Hello to ")
      .pushStyle({ ...textStyle, fontStyle: { weight: 500 } })
      .addText("Skia 🎨")
      .pop()
      .build();
  }, [customFontMgr]);

  // Render the paragraph
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Paragraph paragraph={paragraph} x={0} y={0} width={300} />
    </Canvas>
  );
};
```

Below is the result on Android (left) and iOS (right).
<img src={require("/static/img/paragraph/hello-world-android.png").default} width="256" height="256" />
<img src={require("/static/img/paragraph/hello-world-ios.png").default} width="256" height="256" />

On Web, you will need to provide you own emoji font ([NotoColorEmoji](https://fonts.google.com/noto/specimen/Noto+Color+Emoji) for instance) and add it to the list of font families.

```tsx twoslash
import { useFonts, Skia } from "@shopify/react-native-skia";

const customFontMgr = useFonts({
  Roboto: [
    require("path/to/Roboto-Regular.ttf"),
    require("path/to/Roboto-Medium.ttf")
  ],
  // Only load the emoji font on Web
  Noto: [
    require("path/to/NotoColorEmoji.ttf")
  ]
});

// We add Noto to the list of font families
const textStyle = {
  color: Skia.Color("black"),
  fontFamilies: ["Roboto", "Noto"],
  fontSize: 50,
};
```

## Using Paints

You can use paint objects for the foreground and the background of a text style.

<img src={require("/static/img/paragraph/background-node.png").default} width="256" height="256" />

Below we use a foreground and a background paint on a text style:

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts, Canvas, Rect, TileMode } from "@shopify/react-native-skia";

// Our background shader
const source = Skia.RuntimeEffect.Make(`
uniform vec4 position;
uniform vec4 colors[4];

vec4 main(vec2 pos) {
  vec2 uv = (pos - vec2(position.x, position.y))/vec2(position.z, position.w);
  vec4 colorA = mix(colors[0], colors[1], uv.x);
  vec4 colorB = mix(colors[2], colors[3], uv.x);
  return mix(colorA, colorB, uv.y);
}`)!;

// Define an array of colors for the gradient to be used in shader uniform
const colors = [
  // #dafb61
  0.85, 0.98, 0.38, 1.0,
  // #61dafb
  0.38, 0.85, 0.98, 1.0,
  // #fb61da
  0.98, 0.38, 0.85, 1.0,
  // #61fbcf
  0.38, 0.98, 0.81, 1.0
];

const MyParagraph = () => {
  const paragraph = useMemo(() => {

    // Create a background paint.
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setShader(
      source.makeShader([0, 0, 256, 256, ...colors])
    );

    // Create a foreground paint. We use a radial gradient.
    const foregroundPaint = Skia.Paint();
    foregroundPaint.setShader(
      Skia.Shader.MakeRadialGradient(
        { x: 0, y: 0 },
        256,
        [Skia.Color("magenta"), Skia.Color("yellow")],
        null,
        TileMode.Clamp
      )
    );

    const para = Skia.ParagraphBuilder.Make()
     .pushStyle(
        {
          fontFamilies: ["Roboto"],
          fontSize: 72,
          fontStyle: { weight: 500 },
          color: Skia.Color("black"),
        },
        foregroundPaint,
        backgroundPaint
      )
      .addText("Say Hello to React Native Skia")
      .pop()
      .build();
    return para;
  }, []);
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Paragraph paragraph={paragraph} x={0} y={0} width={256} />
    </Canvas>
  );
};
```

### Applying Effects

The `Paragraph` component doesn't follow the same painting rules as other components.
However you can apply effets using the `layer` property.
For instance, in the example below, we apply a blur image filter.

```tsx twoslash
import React from "react";
import { Canvas, Skia, Group, Paint, Blur, Paragraph } from "@shopify/react-native-skia";

const width = 256;
const height = 256;

export const Demo = () => {
  const paragraph = Skia.ParagraphBuilder.Make()
          .pushStyle({
            color: Skia.Color("black"),
            fontSize: 25,
          })
          .addText("Hello Skia")
          .build();
  return (
    <Canvas style={{ flex: 1 }}>
      <Group layer={<Paint><Blur blur={10} /></Paint>}>
        <Paragraph paragraph={paragraph} x={0} y={0} width={width} />
      </Group>
    </Canvas>
  );
};
```

### Result

<img src={require("/static/img/blurred-paragraph-node.png").default} width="256" height="256" />


## Paragraph Bounding Box

Before getting the paragraph height and width, you need to compute its layout using `layout()` and once done, you can invoke `getHeight()` for the height and `getLongestLine()` for the width.

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts, Canvas, Rect } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const paragraph = useMemo(() => {
    const para = Skia.ParagraphBuilder.Make()
      .addText("Say Hello to React Native Skia")
      .build();
    // Calculate the layout
    para.layout(200);
    return para;
  }, []);
  // Now the paragraph height is available
  const height = paragraph.getHeight();
  const width = paragraph.getLongestLine();
  // Render the paragraph
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      {/* Maximum paragraph width */}
      <Rect x={0} y={0} width={200} height={256} color="magenta" />
      {/* Paragraph bounding box */}
      <Rect x={0} y={0} width={width} height={height} color="cyan" />
      <Paragraph paragraph={paragraph} x={0} y={0} width={200} />
    </Canvas>
  );
};
```

<img src={require("/static/img/paragraph/boundingbox-node.png").default} width="256" height="256" />


## Fonts

By default, the paragraph API will use the system fonts.
You can also use custom fonts with this API as well. 

The `useFonts` hooks allows you to load custom fonts to be used for your Skia drawing.
The font files should be organized by family names.
For example:

```tsx twoslash
import {useFonts} from "@shopify/react-native-skia";

const fontMgr = useFonts({
  Roboto: [
    require("./Roboto-Medium.ttf"),
    require("./Roboto-Regular.ttf"),
    require("./Roboto-Bold.ttf"),
  ],
  Helvetica: [require("./Helvetica.ttf")],
});
if (!fontMgr) {
  // Returns null until all fonts are loaded
}
// Now the fonts are available
```

You can also list the available system fonts via `listFontFamilies()` function.

## Styling Paragraphs

These properties define the overall layout and behavior of a paragraph.

| Property                | Description                                                                           |
|-------------------------|---------------------------------------------------------------------------------------|
| `disableHinting`        | Controls whether text hinting is disabled.                                            |
| `ellipsis`              | Specifies the text to use for ellipsis when text overflows.                           |
| `heightMultiplier`      | Sets the line height as a multiplier of the font size.                                |
| `maxLines`              | Maximum number of lines for the paragraph.                                            |
| `replaceTabCharacters`  | Determines whether tab characters should be replaced with spaces.                     |
| `strutStyle`            | Defines the strut style, which affects the minimum height of a line.                  |
| `textAlign`             | Sets the alignment of text (left, right, center, justify, start, end).                |
| `textDirection`         | Determines the text direction (RTL or LTR).                                           |
| `textHeightBehavior`    | Controls the behavior of text ascent and descent in the first and last lines.         |
| `textStyle`             | Default text style for the paragraph (can be overridden by individual text styles).   |

Below is an example to center text with `textAlign` property:

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, TextAlign, Canvas, Rect } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const paragraph = useMemo(() => {
    const para = Skia.ParagraphBuilder.Make({
          textAlign: TextAlign.Center,
      })
      .addText("Say Hello to React Native Skia")
      .build();
    return para;
  }, []);

  // Render the paragraph with the text center
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Paragraph paragraph={paragraph} x={0} y={0} width={200} />
    </Canvas>
  );
};
```

## Text Style Properties

These properties are used to style specific segments of text within a paragraph.

| Property              | Description                                                                         |
|-----------------------|-------------------------------------------------------------------------------------|
| `backgroundColor`     | Background color of the text.                                                       |
| `color`               | Color of the text.                                                                  |
| `decoration`          | Type of text decoration (underline, overline, line-through).                        |
| `decorationColor`     | Color of the text decoration.                                                       |
| `decorationThickness` | Thickness of the text decoration.                                                   |
| `decorationStyle`     | Style of the text decoration (solid, double, dotted, dashed, wavy).                 |
| `fontFamilies`        | List of font families for the text.                                                 |
| `fontFeatures`        | List of font features.                                                              |
| `fontSize`            | Font size of the text.                                                              |
| `fontStyle`           | Font style (weight, width, slant).                                                  |
| `fontVariations`      | Font variations.                                                                    |
| `foregroundColor`     | Foreground color (for effects like gradients).                                      |
| `heightMultiplier`    | Multiplier for line height.                                                         |
| `halfLeading`         | Controls half-leading value.                                                        |
| `letterSpacing`       | Space between characters.                                                           |
| `locale`              | Locale for the text (affects things like sorting).                                  |
| `shadows`             | List of text shadows.                                                               |
| `textBaseline`        | Baseline for the text (alphabetic, ideographic).                                    |
| `wordSpacing`         | Space between words.                                                                |

These tables offer a quick reference to differentiate between paragraph and text styles in React Native Skia. You can use them to guide developers on how to apply various styles to create visually appealing and functional text layouts.
Below is an example using different font styling:

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts, FontStyle } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const customFontMgr = useFonts({
    Roboto: [
        require("path/to/Roboto-Italic.ttf"),
        require("path/to/Roboto-Regular.ttf"),
        require("path/to/Roboto-Bold.ttf")
    ],
  });

  const paragraph = useMemo(() => {
    // Are the custom fonts loaded?
    if (!customFontMgr) {
      return null;
    }
    const textStyle = {
      fontSize: 24,
      fontFamilies: ["Roboto"],
      color: Skia.Color("#000"),
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr);
    paragraphBuilder
      .pushStyle({ ...textStyle, fontStyle: FontStyle.Bold })
      .addText("This text is bold\n")
      .pop()
      .pushStyle({ ...textStyle, fontStyle: FontStyle.Normal })
      .addText("This text is regular\n")
      .pop()
      .pushStyle({ ...textStyle, fontStyle: FontStyle.Italic })
      .addText("This text is italic")
      .pop()
      .build();
    return paragraphBuilder.build();
  }, [customFontMgr]);

  return <Paragraph paragraph={paragraph} x={0} y={0} width={300} />;
};
```

#### Result

<img src={require("/static/img/paragraph/font-style-node.png").default} width="256" height="256" />


Draws text along a path.

| Name        | Type               |  Description                                                 |
|:------------|:-------------------|:-------------------------------------------------------------|
| path        | `Path` or `string` | Path to draw. Can be a string using the [SVG Path notation](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands) or an object created with `Skia.Path.Make()` |
| text        | `string`           | Text to draw                                                 |
| font        | `SkFont`             | Font to use                                                  |

## Example

```tsx twoslash
import {Canvas, Group, TextPath, Skia, useFont, vec, Fill} from "@shopify/react-native-skia";

const size = 128;
const path = Skia.Path.Make();
path.addCircle(size, size, size/2);

export const HelloWorld = () => {
  const font = useFont(require("./my-font.ttf"), 24);
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />
      <Group transform={[{ rotate: Math.PI }]} origin={vec(size, size)}>
        <TextPath font={font} path={path} text="Hello World!" />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/text/text-path.png").default} width="256" height="256" />

The text component can be used to draw a simple text.
Please note that the y origin of the Text is the bottom of the text, not the top.

| Name        | Type       |  Description                                                    |
|:------------|:-----------|:----------------------------------------------------------------|
| text        | `string`   | Text to draw                                                    |
| font        | `SkFont`   | Font to use                                                     |
| x           | `number`   | Left position of the text (default is 0)                        |
| y           | `number`   | Bottom position the text (default is 0, the )                   |

### Simple Text

```tsx twoslash
import {Canvas, Text, useFont, Fill} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const fontSize = 32;
  const font = useFont(require("./my-font.ttf"), fontSize);
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />
      <Text
        x={0}
        y={fontSize}
        text="Hello World"
        font={font}
      />
    </Canvas>
  );
};
```

<img src={require("/static/img/text/hello-world.png").default} width="256" height="256" />

## Fonts

Once the fonts are loaded, we provide a `matchFont` function that given a font style will return a font object that you can use directly.

:::info

For font matching we recommend using the [Paragraph API](/docs/text/paragraph/) instead.
The APIs belows were made available before the Paragraph API was released.

:::

```tsx twoslash
import {useFonts, Text, matchFont} from "@shopify/react-native-skia";

const Demo = () => {
  const fontMgr = useFonts({
    Roboto: [
      require("./Roboto-Medium.ttf"),
      require("./Roboto-Regular.ttf"),
      require("./Roboto-Bold.ttf"),
    ]
  });
  if (!fontMgr) {
    return null;
  }
  const fontStyle = {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 16
  } as const;
  const font = matchFont(fontStyle, fontMgr);
  return (
    <Text text="Hello World" y={32} x={32} font={font} />
  );
};
```

## System Fonts

System fonts are available via `Skia.FontMgr.System()`.
You can list system fonts via  `listFontFamilies` function returns the list of available system font families.
By default the function will list system fonts but you can pass an optional `fontMgr` object as parameter.

```jsx twoslash
import {listFontFamilies} from "@shopify/react-native-skia";

console.log(listFontFamilies());
```

Output example on Android:
```
["sans-serif", "arial", "helvetica", "tahoma", "verdana", ...]
```

or on iOS:
```
["Academy Engraved LET", "Al Nile", "American Typewriter", "Apple Color Emoji", ...]
```

By default matchFont, will match fonts from the system font manager:

```jsx twoslash
import {Platform} from "react-native";
import {Canvas, Text, matchFont, Fill, Skia} from "@shopify/react-native-skia";
 
const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
const fontStyle = {
  fontFamily,
  fontSize: 14,
  fontStyle: "italic",
  fontWeight: "bold",
};
const font = matchFont(fontStyle);

export const HelloWorld = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />
      <Text
        x={0}
        y={fontStyle.fontSize}
        text="Hello World"
        font={font}
      />
    </Canvas>
  );
};
```

The `fontStyle` object can have the following list of optional attributes:

- `fontFamily`: The name of the font family.
- `fontSize`: The size of the font.
- `fontStyle`: The slant of the font. Can be `normal`, `italic`, or `oblique`.
- `fontWeight`: The weight of the font. Can be `normal`, `bold`, or any of `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`.

By default, `matchFont` uses the system font manager to match the font style. However, if you want to use your custom font manager, you can pass it as the second parameter to the `matchFont` function:

```jsx twoslash
import {matchFont, useFonts} from "@shopify/react-native-skia";

const fontMgr = useFonts({
  Roboto: [
    require("../../Tests/assets/Roboto-Medium.ttf"),
    require("../../Tests/assets/Roboto-Bold.ttf"),
  ]
});

const font = matchFont(fontStyle, fontMgr);
```

## Low-level API

The basic usage of the system font manager is as follows.
These are the APIs used behind the scene by the `matchFont` function.

```tsx twoslash
import {Platform} from "react-native";
import {Skia, FontStyle} from "@shopify/react-native-skia";
 
const familyName = Platform.select({ ios: "Helvetica", default: "serif" });
const fontSize = 32;
// Get the system font manager
const fontMgr = Skia.FontMgr.System();
// The custom font manager is available via Skia.TypefaceFontProvider.Make()
const customFontMgr = Skia.TypefaceFontProvider.Make();
// typeface needs to be loaded via Skia.Data and instanciated via
// Skia.Typeface.MakeFreeTypeFaceFromData()
// customFontMgr.registerTypeface(customTypeFace, "Roboto");

// Matching a font
const typeface =  fontMgr.matchFamilyStyle(familyName, FontStyle.Bold);
const font = Skia.Font(typeface, fontSize);
```


