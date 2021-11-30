import React from "react";
import {
  Skia,
  useDrawCallback,
  SkiaView,
  TileMode,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const colorMatrix = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 18, -7,
];

export const Gooey = () => {
  const onDraw = useDrawCallback((canvas) => {
    const bg = Skia.Paint();
    bg.setColor(Skia.Color("blue"));
    canvas.drawPaint(bg);
    const fg = Skia.Paint();
    fg.setColor(Skia.Color("green"));
    const debug = Skia.Paint();
    debug.setColor(Skia.Color("red"));
    debug.setAlphaf(0.25);
    const paint = Skia.Paint();
    const filter = Skia.ImageFilter.MakeColorFilter(
      Skia.ColorFilter.MakeMatrix(colorMatrix),
      Skia.ImageFilter.MakeBlur(20.0, 20.0, TileMode.Decal, null)
    );
    paint.setImageFilter(filter);
    canvas.saveLayer(paint);
    canvas.drawCircle(50, height / 2, width / 2, fg);
    canvas.drawCircle(width - 50, height / 2, width / 2, fg);
    canvas.restore();
    canvas.drawCircle(50, height / 2, width / 2, debug);
    canvas.drawCircle(width - 50, height / 2, width / 2, debug);
  }, []);
  return <SkiaView style={{ flex: 1 }} onDraw={onDraw} />;
};
