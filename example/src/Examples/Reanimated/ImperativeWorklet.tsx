import React, { useEffect, useRef } from "react";
import { PixelRatio, useWindowDimensions } from "react-native";
import { runOnUI, withRepeat, withTiming } from "react-native-reanimated";
import {
  Skia,
  vec,
  TileMode,
  SkiaImperativeView,
} from "@shopify/react-native-skia";
import { makeUIMutable } from "react-native-reanimated/src/reanimated2/mutables";
import { SkiaViewApi } from "@shopify/react-native-skia/src/views/api";

const ratio = PixelRatio.get();

export const ImperativeWorkletExample: React.FC = () => {
  const dimensions = useWindowDimensions();
  const ref = useRef<SkiaImperativeView>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const nativeId = ref.current?.nativeId!;

    runOnUI(() => {
      "worklet";

      const point = makeUIMutable(0);

      point.value = withRepeat(withTiming(50, { duration: 1000 }), -1, true);

      const paint = Skia.Paint();

      const end = vec(0, 100);
      const colors = [Skia.Color("transparent"), Skia.Color("black")];
      const transparent = Skia.Color("transparent");

      const frame = () => {
        const canvas = SkiaViewApi.getCanvas(nativeId);

        if (canvas) {
          canvas.clear(transparent);

          canvas.save();
          canvas.scale(ratio, ratio);

          const start = vec(0, point.value);
          const gradient = Skia.Shader.MakeLinearGradient(
            start,
            end,
            colors,
            null,
            TileMode.Clamp
          );
          paint.setShader(gradient);
          canvas.drawRect(Skia.XYWHRect(0, 0, dimensions.width, 100), paint);

          canvas.restore();
        }

        SkiaViewApi.renderImmediate(nativeId);

        requestAnimationFrame(frame);
      };

      frame();
    })();
  }, []);

  return (
    <SkiaImperativeView
      ref={ref}
      style={{ height: 100, width: dimensions.width }}
    />
  );
};
