---
id: atlas
title: Atlas
sidebar_label: Atlas
slug: /shapes/atlas
---

The Atlas component is used for efficient rendering of multiple instances of the same texture or image. It is especially useful for drawing a very large number of similar objects, like sprites, with varying transformations.

| Name    | Type             |  Description     |
|:--------|:-----------------|:-----------------|
| image   | `SkImage | null` | Altas: image containing the sprites. |
| sprites | `SkRect[]` | locations of sprites in atlas.             |
| transforms | `RSXForm[]` | Rotation/scale transforms to be applied for each sprite. |
| colors? | `SkColor[]` | Optional. Color to blend the sprites with. |
| blendMode? | `BlendMode` | Optional. Blend mode used to combine sprites and colors together. |

## Hello World

In the example below, we draw in simple rectangle as a texture.
Then we display that rectangle 150 times with a simple transformation applied to each rectangle.

```tsx twoslash

```

## Animations