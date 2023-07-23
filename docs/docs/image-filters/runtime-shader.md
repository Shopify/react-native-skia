---
id: runtime-shader
title: Runtime Shader
sidebar_label: Runtime Shader
slug: /image-filters/runtime-shader
---

The `RuntimeShader` image filter allows you to write your own [Skia Shader](/docs/shaders/overview) as an image filter.
This component receives the currently filtered image as a shader uniform (or the implicit source image if no children are provided).

:::info

Because RuntimeShader relies on texture sampling of the Skia drawing, we recommend to apply a technic known as super sampling. [See below](#supersampling).

:::


| Name      | Type              |  Description                     |
|:----------|:------------------|:---------------------------------|
| source    | `SkRuntimeEffect` | Shader to use as an image filter |
| children? | `ImageFilter`   | Optional image filter to be applied first |


## Example

The example below generates a circle with a green mint color.
The circle is first draw with the lightblue color `#add8e6` and the runtime shader switches the blue with the green channel: we get mint green `#ade6d8`.

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

## Supersampling

To keep the output of the image filter crisp, We upscale to filtered drawing to the [pixel density of the app](https://reactnative.dev/docs/pixelratio). Once the drawing is filtered, we scale it back to the original size. This can be seen in the example below. These operations need to be performed on a Skia layer via the `layer` property.

```tsx twoslash
import {Canvas, Text, RuntimeShader, Skia, Group, Circle, Paint} from "@shopify/react-native-skia";
import {PixelRatio} from "react-native";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;

half4 main(float2 xy) {
  return image.eval(xy).rbga;
}
`)!;

export const RuntimeShaderDemo = () => {
  const r = 128;
  const pd = PixelRatio.get();
  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={[{ scale: 1/ pd }]}>
        <Group
          transform={[{ scale: pd }]}
          layer={<Paint>
            <RuntimeShader source={source} />
          </Paint>}
        >
          <Circle cx={r} cy={r} r={r} color="lightblue" />
        </Group>
      </Group>
    </Canvas>
  );
};
```