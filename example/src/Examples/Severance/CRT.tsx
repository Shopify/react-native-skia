import {
  Group,
  SkPaint,
  SkRect,
  createDrawing,
  FilterMode,
  Skia,
  TileMode,
  RuntimeShader,
} from "@shopify/react-native-skia";
import type { ReactNode } from "react";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const source = Skia.RuntimeEffect.Make(`
uniform shader image;

vec2 curveRemapUV(vec2 uv)
{
    // as we near the edge of our screen apply greater distortion using a sinusoid.
    float curvature = 4.0;
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / curvature;
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
}

vec4 scanLineIntensity(float x, float f, float opacity)
{
    float intensity = ((0.5 * sin(x * f)) + 0.5) * 0.9 + 0.1;
    return vec4(vec3(pow(intensity, opacity)), 1.0);
}

half4 main(float2 xy) {
  vec2 scanLineOpacity = vec2(0.25, 0.25);
  vec2 resolution = vec2(${width}, ${height});
  vec2 uv = xy/resolution;

  vec2 remappedUV = curveRemapUV(vec2(uv.x, uv.y));
  vec4 baseColor = image.eval(remappedUV * resolution);


  baseColor *= scanLineIntensity(remappedUV.x, 900, scanLineOpacity.x);
  baseColor *= scanLineIntensity(remappedUV.y, 900, scanLineOpacity.y);

  baseColor *= vec4(vec3(1.5), 1.0);

  if (remappedUV.x < 0.0 || remappedUV.y < 0.0 || remappedUV.x > 1.0 || remappedUV.y > 1.0){
      return vec4(0.0, 0.0, 0.0, 1.0);
  } else {
      return baseColor;
  }
}
`)!;

interface CRTProps {
  children: ReactNode | ReactNode[];
}

export const CRT = ({ children }: CRTProps) => {
  return (
    <Group>
      <RuntimeShader source={source} childName="image" />
      {children}
    </Group>
  );
};
