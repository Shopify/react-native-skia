import {
  BlendMode,
  ClipOp,
  PaintStyle,
  Skia,
  SkiaView,
  useDrawCallback,
} from "@shopify/react-native-skia";
import type { ReactElement } from "react";
import React, { useState } from "react";

interface WarmupSkiaProps {
  children: ReactElement | ReactElement[];
}

const width = 100;
const height = 100;
const drawCallSpacing = 0;

export const WarmupSkia = ({ children }: WarmupSkiaProps) => {
  const [ready, setReady] = useState(true);
  const onDraw = useDrawCallback((canvas) => {
    const rrect = Skia.RRectXY(Skia.XYWHRect(20, 20, 40, 40), 10, 10);
    const rrectPath = Skia.Path.Make().addRRect(rrect);
    const circlePath = Skia.Path.Make().addOval(Skia.XYWHRect(0, 0, 40, 40));

    // The following path is based on
    // https://skia.org/user/api/SkCanvas_Reference#SkCanvas_drawPath
    const path = Skia.Path.Make();
    path.moveTo(20, 60);
    path.quadTo(60, 20, 60, 60);
    path.close();
    path.moveTo(60, 20);
    path.quadTo(60, 60, 20, 60);

    const convexPath = Skia.Path.Make();
    convexPath.moveTo(20, 30);
    convexPath.lineTo(40, 20);
    convexPath.lineTo(60, 30);
    convexPath.lineTo(60, 60);
    convexPath.lineTo(20, 60);
    convexPath.close();

    // Skia uses different shaders based on the kinds of paths being drawn and
    // the associated paint configurations. According to our experience and
    // tracing, drawing the following paths/paints generates various of
    // shaders that are commonly used.
    const paths = [rrectPath, circlePath, path, convexPath];
    const p1 = Skia.Paint();
    p1.setAntiAlias(true);
    p1.setStyle(PaintStyle.Fill);
    const p2 = p1.copy();
    p2.setAntiAlias(false);
    const p3 = p1.copy();
    p3.setStyle(PaintStyle.Stroke);
    p3.setStrokeWidth(10);
    const p4 = p3.copy();
    p4.setStrokeWidth(0.1); // hairline
    const p5 = p3.copy();
    p5.setColorFilter(
      Skia.ColorFilter.MakeBlend(Skia.Color("lightblue"), BlendMode.SrcIn)
    );
    const paints = [p1, p2, p3, p4, p5];

    for (let i = 0; i < paths.length; i++) {
      canvas.save();
      for (let j = 0; j < paints.length; j++) {
        canvas.drawPath(paths[i], paints[j]);
        canvas.translate(drawCallSpacing, 0);
      }
      canvas.restore();
      canvas.translate(0, drawCallSpacing);
    }

    // // Warm up shadow shaders.
    // const  black = Skia.Color("black");
    // canvas.save();
    // canvas.drawShadow(rrectPath, black, 10, true);
    // canvas.translate(drawCallSpacing, 0);
    // canvas.drawShadow(rrectPath, black, 10, false);
    // canvas.restore();

    // Draw a rect inside a rrect with a non-trivial intersection. If the
    // intersection is trivial (e.g., equals the rrect clip), Skia will optimize
    // the clip out.
    //
    // Add an integral or fractional translation to trigger Skia's non-AA or AA
    // optimizations (as did before in normal FillRectOp in rrect clip cases).
    [0, 0.5].forEach((fraction) => {
      canvas.save();
      canvas.translate(fraction, fraction);
      canvas.clipRRect(
        Skia.RRectXY(Skia.XYWHRect(8, 8, 320, 240), 16, 16),
        ClipOp.Intersect,
        true
      );
      canvas.drawRect(Skia.XYWHRect(10, 10, 300, 220), Skia.Paint());
      canvas.translate(drawCallSpacing, 0);
    });
    canvas.translate(0, drawCallSpacing);
    setReady(true);
  });
  if (ready) {
    return <>{children}</>;
  }
  return <SkiaView style={{ width, height }} onDraw={onDraw} />;
};
