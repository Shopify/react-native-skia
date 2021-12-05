---
id: paint-properties
title: Paint Properties
sidebar_label: Properties
slug: /paint/properties
---

## Color

Sets alpha and RGB used when stroking and filling.
The color is a string or a number.

```tsx twoslash
import {Paint} from "@shopify/react-native-skia";

<>
  <Paint color="red" />
  {/* 0xffff0000 is also red (format is argb) */}
  <Paint color={0xffff0000} />
</>
```

## Opacity

Replaces alpha, leaving RGBA unchanged. 0 means fully transparent, 1.0 means opaque.
When setting opacity in a Group component the alpha component of all descending colors will inherit that value.

```tsx twoslash
import {Canvas, Circle, Group} from "@shopify/react-native-skia";

export const OpacityDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Group opacity={0.5}>
        <Circle cx={50} cy={50} r={50} color="red" />
      </Group>
    </Canvas>
  )
};

```

## Blend Mode

Sets the blend mode that is, the mode used to combine source color with destination color.
The following values are available: `clear`, `src`, `dst`, `srcOver`, `dstOver`, `srcIn`, `dstIn`, `srcOut`, `dstOut`,
`srcATop`, `dstATop`, `xor`, `plus`, `modulate`, `screen`, `overlay`, `darken`, `lighten`, `colorDodge`, `colorBurn`, `hardLight`,
`softLight`, `difference`, `exclusion`, `multiply`, `hue`, `saturation`, `color`, `luminosity`.

## Style

The style of the paint can be `fill` (default) or `stroke`.

## Stroke Width

Thickness of the pen used to outline the shape.

## Stroke Join

Sets the geometry drawn at the corners of strokes.
Values can be `bevel`, `miter`, or `round`.

## Stroke Cap

Returns the geometry drawn at the beginning and end of strokes.
Values can be `butt`, `round`, or `square`.

## Stroke Miter

Limit at which a sharp corner is drawn beveled.