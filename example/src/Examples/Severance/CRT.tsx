import type { SkPaint, SkRect } from "@shopify/react-native-skia";
import {
  createDrawing,
  FilterMode,
  Skia,
  TileMode,
} from "@shopify/react-native-skia";
import type { ReactNode } from "react";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const source = Skia.RuntimeEffect.Make(`
uniform shader image;
vec2 curveRemapUV(vec2 uv) {
  vec2 curvature = vec2(4.5); //zoom level of curvature (lower = curvier)
  // as we near the edge of our screen apply greater distortion using a cubic function
  uv = uv * 2.0 - 1.0;
  vec2 offset = abs(uv.yx) / vec2(curvature.x, curvature.y);
  uv = uv + uv * offset * offset;
  uv = uv * 0.5 + 0.5;
  return uv;
}
half4 main(float2 xy) {
  vec2 u_resolution = vec2(${width}, ${height});
  vec2 uv = xy/u_resolution;
  float PI = 3.141592653589793;
 // uv.y = u_resolution.y/2 - uv.y; //flip the incoming image texture
 
  vec2 remappedUV = curveRemapUV(uv);
  vec4 baseColor = image.eval(remappedUV * u_resolution);
  float line_count = 300.0;
  float opacity = 0.65;
  float y_lines = sin(remappedUV.y * line_count * PI * 2.0);
  y_lines = (y_lines * 0.5 + 0.5) * 0.9 + 0.1;
  float x_lines = sin(remappedUV.x * line_count * PI * 2.0);
  x_lines = (x_lines * 0.5 + 0.5) * 0.9 + 0.1;
  vec4 scan_line = vec4(vec3(pow(y_lines, opacity)), 1.0);
  vec4 scan_line_x = vec4(vec3(pow(x_lines, opacity)), 1.0);
  // boosting the brightness, altering the hue to be more blue
  float avg = baseColor.r + baseColor.g + baseColor.b / 3.0;
  if (avg > 0.5) {
    baseColor *= vec4(vec3(0.4, 1.0, 1.2), 1.0) * 8.0;  
  } else {
    baseColor *= vec4(vec3(0.2, 1.2, 1.5), 1.0) * 2.0;  
  }
  
  baseColor *= scan_line;
  baseColor *= scan_line_x;
  
  if (remappedUV.x < 0.0 || remappedUV.y < 0.0 || remappedUV.x > 1.0 || remappedUV.y > 1.0) {
    return vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    return baseColor;
  }
}
`)!;

const onDraw = createDrawing<CRTProps>((ctx, { rect: boundingRect }, node) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(boundingRect);
  node.visit({
    ...ctx,
    canvas,
  });
  const pic = recorder.finishRecordingAsPicture();
  const shaderPaint = Skia.Paint();
  shaderPaint.setShader(
    source.makeShaderWithChildren([], true, [
      pic.makeShader(TileMode.Decal, TileMode.Decal, FilterMode.Nearest),
    ])
  );
  ctx.canvas.drawPaint(shaderPaint);
});

interface CRTProps {
  children: ReactNode | ReactNode[];
  rect: SkRect;
}

export const CRT = (props: CRTProps) => {
  return <skDrawing onDraw={onDraw} skipProcessing {...props} />;
};
