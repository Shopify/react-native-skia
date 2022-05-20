---
id: runtime-shader
title: Runtime Shader
sidebar_label: Runtime Shader
slug: /image-filters/runtime-shader
---

The `RuntimeShader` image filter allows you to write your own [Skia Shader](/docs/shaders/overview) as an image filter.
This component receive the currently filtered image as a shader uniform (or the implicit source image if no children are provided). 


| Name      | Type              |  Description                     |
|:----------|:------------------|:---------------------------------|
| source    | `SkRuntimeEffect` | Shader to use as an image filter |
| children? | `ImageFilter`   | Optional image filter to be applied first |


## Example

The example below generates a circle with a green mint color.
The circle is first draw with the lightblue color `#add8e6` and the runtime shader switches the blue and green channel: we get mint green `#ade6d8`.

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