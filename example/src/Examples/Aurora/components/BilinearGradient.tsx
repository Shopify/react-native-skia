import React from "react";
import type { ColorProp, Vector } from "@shopify/react-native-skia";
import {
  processColorAsUnitArray,
  Shader,
  Skia,
} from "@shopify/react-native-skia";

const source = Skia.RuntimeEffect.Make(`
uniform vec2 size;
uniform vec4 color0;
uniform vec4 color1;
uniform vec4 color2;
uniform vec4 color3;

vec4 main(vec2 pos) {
  vec2 uv = pos/size;
  vec4 colorA = mix(color0, color1, uv.x);
  vec4 colorB = mix(color2, color3, uv.x);
  return mix(colorA, colorB, uv.y);
}`)!;

interface BilinearGradientProps {
  size: Vector;
  colors: ColorProp[];
}

export const BilinearGradient = ({ size, colors }: BilinearGradientProps) => {
  const [color0, color1, color2, color3] = colors.map((cl) =>
    processColorAsUnitArray(cl, 1)
  );
  return (
    <Shader
      source={source}
      uniforms={{ size, color0, color1, color2, color3 }}
    />
  );
};
