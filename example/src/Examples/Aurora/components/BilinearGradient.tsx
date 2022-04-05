import React from "react";
import type { Vector, Color } from "@shopify/react-native-skia";
import {
  processColorAsUnitArray,
  Shader,
  Skia,
} from "@shopify/react-native-skia";

const source = Skia.RuntimeEffect.Make(`
uniform vec2 size;
uniform vec4 colors[4];

vec4 main(vec2 pos) {
  vec2 uv = pos/size;
  vec4 colorA = mix(colors[0], colors[1], uv.x);
  vec4 colorB = mix(colors[2], colors[3], uv.x);
  return mix(colorA, colorB, uv.y);
}`)!;

interface BilinearGradientProps {
  size: Vector;
  colors: Color[];
}

export const BilinearGradient = ({ size, colors }: BilinearGradientProps) => {
  const processedColors = colors.map((cl) => processColorAsUnitArray(cl, 1));
  return (
    <Shader source={source} uniforms={{ size, colors: processedColors }} />
  );
};
