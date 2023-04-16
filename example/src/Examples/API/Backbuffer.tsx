import React, { useRef } from "react";
import type { SkShader } from "@shopify/react-native-skia";
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
uniform shader iChannel0;

half4 main(vec2 fragCoord)
{
    float distance = length(fragCoord.xy - iMouse.xy);
    if (distance < 9.0 && iMouse.z > 0.01) {
        return vec4(1.0, 0.0, 0.0, 1.0);
    }

    return iChannel0.eval(fragCoord);
}`;

const { width, height } = Dimensions.get("window");
const offscreen = Skia.Surface.Make(width, height)!;

export const Backbuffer = () => {
  const backbuffer = useRef<SkShader>(
    Skia.Shader.MakeColor(Float32Array.of(0, 0, 0, 1))
  );
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
        [touch.x, touch.y, touch.z],
        [backbuffer.current]
      )
    );
    offscreen.getCanvas().drawPaint(paint);

    // 2. Swap
    backbuffer.current = offscreen
      .makeImageSnapshot()
      .makeShaderOptions(
        TileMode.Decal,
        TileMode.Decal,
        FilterMode.Nearest,
        MipmapMode.None
      );

    // 3. Draw Result
    const frontPaint = Skia.Paint();
    frontPaint.setShader(backbuffer.current);
    canvas.drawPaint(frontPaint);
  });
  return <SkiaView style={{ flex: 1 }} onDraw={onDraw} />;
};
