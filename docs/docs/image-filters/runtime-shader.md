---
id: runtime-shader
title: Runtime Shader
sidebar_label: Runtime Shader
slug: /image-filters/runtime-shader
---

The `RuntimeShader` image filter allows you to provide your own [Skia Shader](/docs/shaders/overview) as an image filter.

| Name      | Type              |  Description                     |
|:----------|:------------------|:---------------------------------|
| source    | `SkRuntimeEffect` | Shader to use as an image filter |

## Example

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