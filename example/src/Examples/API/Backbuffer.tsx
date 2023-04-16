import React, { useRef } from "react";
import {
  FilterMode,
  MipmapMode,
  Skia,
  SkiaView,
  TileMode,
  useDrawCallback,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

import { frag } from "../../components/Tags";

const bufferA = frag`
uniform vec3 iMouse;
uniform vec2 iResolution;
uniform shader iChannel0;

half4 main(vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    
    vec3 color = iChannel0.eval(uv).rgb;

    float distance = length(fragCoord.xy - iMouse.xy);
    if (distance < 9.0 && iMouse.z > 0.01) {
        color = vec3(1.0, 0.0, 0.0);
    }

    return vec4(color, 1.0);
}`;

const { width, height } = Dimensions.get("window");
const backbuffer = Skia.Surface.Make(width, height)!;

const bg = Skia.Shader.MakeColor(Float32Array.of(0.3, 0.6, 0.9, 1));

export const Backbuffer = () => {
  const backshader = useRef(bg);
  const onDraw = useDrawCallback((canvas, info) => {
    const touch = { x: 0, y: 0, z: 0 };
    const lastTouch = info.touches[0];
    if (lastTouch) {
      touch.x = lastTouch[0].x;
      touch.y = lastTouch[0].y;
      touch.z = 1;
    }

    // 1. Draw to the backbuffer
    const paint = Skia.Paint();
    paint.setShader(
      bufferA.makeShaderWithChildren(
        [touch.x, touch.y, touch.z, width, height],
        [backshader.current]
      )
    );
    backbuffer.getCanvas().drawPaint(paint);

    // 2. Swap
    backshader.current = backbuffer
      .makeImageSnapshot()
      .makeShaderOptions(
        TileMode.Decal,
        TileMode.Decal,
        FilterMode.Nearest,
        MipmapMode.None
      );

    // 3. Draw Result
    const frontPaint = Skia.Paint();
    frontPaint.setShader(backshader.current);
    canvas.drawPaint(frontPaint);
  });
  return <SkiaView style={{ flex: 1 }} onDraw={onDraw} />;
};
