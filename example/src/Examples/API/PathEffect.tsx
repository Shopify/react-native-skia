import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import type { ICanvas, IPaint } from "@shopify/react-native-skia";
import {
  Skia,
  useDrawCallback,
  SkiaView,
  PaintStyle,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";

const { width } = Dimensions.get("window");
const SIZE = width;
const path = Skia.Path.MakeFromSVGString(
  // eslint-disable-next-line max-len
  "M466 91C466 141.258 361.682 182 233 182C104.318 182 0 141.258 0 91C0 40.7421 104.318 0 233 0C361.682 0 466 40.7421 466 91Z"
)!;

const vWidth = 466;
const vHeight = 182;
const vOrigin = { x: vWidth / 2, y: vHeight / 2 };
const scale = (SIZE - 64) / vWidth;
const origin = { x: (vWidth * scale) / 2, y: (vHeight * scale) / 2 };
const center = { x: SIZE / 2, y: SIZE / 2 };
const basePaint = Skia.Paint();
basePaint.setAntiAlias(true);
basePaint.setColor(Skia.Color("#61DAFB"));

const strokePaint = basePaint.copy();
strokePaint.setStyle(PaintStyle.Stroke);
strokePaint.setStrokeWidth(15);
strokePaint.setPathEffect(Skia.PathEffect.MakeDiscrete(10, 4, 0));

const transparentPaint = basePaint.copy();
transparentPaint.setStyle(PaintStyle.Stroke);
transparentPaint.setStrokeWidth(15);
transparentPaint.setAlphaf(0.2);

const drawLogo = (canvas: ICanvas, paint: IPaint) => {
  canvas.drawCircle(center.x, center.y, 30, basePaint);
  canvas.save();
  canvas.translate(center.x - origin.x, center.y - origin.y);
  canvas.scale(scale, scale);
  canvas.drawPath(path, paint);
  canvas.restore();

  canvas.save();
  canvas.translate(center.x - origin.x, center.y - origin.y);
  canvas.scale(scale, scale);
  canvas.translate(vOrigin.x, vOrigin.y);
  canvas.rotate(60, 0, 0);
  canvas.translate(-vOrigin.x, -vOrigin.y);
  canvas.drawPath(path, paint);
  canvas.restore();

  canvas.save();
  canvas.translate(center.x - origin.x, center.y - origin.y);
  canvas.scale(scale, scale);
  canvas.translate(vOrigin.x, vOrigin.y);
  canvas.rotate(-60, 0, 0);
  canvas.translate(-vOrigin.x, -vOrigin.y);
  canvas.drawPath(path, paint);
  canvas.restore();
};

const drawSquaredLogo = (canvas: ICanvas, paint: IPaint) => {
  canvas.drawCircle(center.x, center.y, 30, basePaint);
  canvas.save();
  canvas.translate(center.x - origin.x, center.y - origin.y);
  canvas.scale(scale, scale);
  canvas.drawRect(Skia.XYWHRect(0, 0, vWidth, vHeight), paint);
  canvas.drawRect(Skia.XYWHRect(0, 0, vWidth, vHeight), transparentPaint);
  canvas.restore();

  canvas.save();
  canvas.translate(center.x - origin.x, center.y - origin.y);
  canvas.scale(scale, scale);
  canvas.translate(vOrigin.x, vOrigin.y);
  canvas.rotate(60, 0, 0);
  canvas.translate(-vOrigin.x, -vOrigin.y);
  canvas.drawRect(Skia.XYWHRect(0, 0, vWidth, vHeight), paint);
  canvas.drawRect(Skia.XYWHRect(0, 0, vWidth, vHeight), transparentPaint);
  canvas.restore();

  canvas.save();
  canvas.translate(center.x - origin.x, center.y - origin.y);
  canvas.scale(scale, scale);
  canvas.translate(vOrigin.x, vOrigin.y);
  canvas.rotate(-60, 0, 0);
  canvas.translate(-vOrigin.x, -vOrigin.y);
  canvas.drawRect(Skia.XYWHRect(0, 0, vWidth, vHeight), paint);
  canvas.drawRect(Skia.XYWHRect(0, 0, vWidth, vHeight), transparentPaint);
  canvas.restore();
};

export const PathEffect = () => {
  const onMakeDiscreteDraw = useDrawCallback((canvas) => {
    const paint = strokePaint.copy();
    paint.setPathEffect(Skia.PathEffect.MakeDiscrete(10, 4, 0));
    drawLogo(canvas, paint);
  }, []);
  const onMakeDashDraw = useDrawCallback((canvas) => {
    const paint = strokePaint.copy();
    paint.setPathEffect(Skia.PathEffect.MakeDash([10, 10], 0));
    drawLogo(canvas, paint);
  }, []);
  const onMakeCornerDraw = useDrawCallback((canvas) => {
    const paint = strokePaint.copy();
    paint.setPathEffect(Skia.PathEffect.MakeCorner(250)!);
    drawSquaredLogo(canvas, paint);
  }, []);
  return (
    <ScrollView>
      <Title>MakeDiscrete</Title>
      <SkiaView style={styles.container} onDraw={onMakeDiscreteDraw} />

      <Title>MakeDash</Title>
      <SkiaView style={styles.container} onDraw={onMakeDashDraw} />

      <Title>MakeCorner</Title>
      <SkiaView style={styles.container} onDraw={onMakeCornerDraw} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
  },
});
