import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  Skia,
  useDrawCallback,
  SkiaView,
  PaintStyle,
  PointMode,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";

const { width } = Dimensions.get("window");
const SIZE = width / 4;
const paint = Skia.Paint();
paint.setAntiAlias(true);
paint.setColor(Skia.Color("#61DAFB"));

const strokePaint = paint.copy();
strokePaint.setStyle(PaintStyle.Stroke);
strokePaint.setStrokeWidth(2);

const c = { x: width / 2, y: SIZE / 2 + 16 };
const S = 25;
const c1 = [
  Skia.Point(c.x - 2 * S, c.y - S),
  Skia.Point(c.x - S, c.y - 2 * S),
  Skia.Point(c.x - S, c.y - S),
];

const c2 = [
  Skia.Point(c.x, c.y - 2 * S),
  Skia.Point(c.x + S, c.y),
  Skia.Point(c.x + S, c.y - S),
];

const c3 = [
  Skia.Point(c.x - 10, c.y + 10),
  Skia.Point(c.x + S, c.y),
  Skia.Point(c.x + S, c.y + S),
];

const c4 = [
  Skia.Point(c.x - 2 * S, c.y + S),
  Skia.Point(c.x - S, c.y + 2 * S),
  Skia.Point(c.x - S, c.y + S),
];

const cubics = [...c1, ...c2, ...c3, ...c4];

export const Shapes = () => {
  const onRectDraw = useDrawCallback((canvas) => {
    const PADDING = 16;
    canvas.drawRect(Skia.XYWHRect(PADDING, PADDING, SIZE, SIZE), paint);
    canvas.drawRRect(
      Skia.RRectXY(
        Skia.XYWHRect(SIZE + 2 * PADDING, PADDING, SIZE, SIZE),
        25,
        25
      ),
      paint
    );
    canvas.drawDRRect(
      Skia.RRectXY(
        Skia.XYWHRect(2 * SIZE + 3 * 16, PADDING, SIZE, SIZE),
        25,
        25
      ),
      Skia.RRectXY(
        Skia.XYWHRect(
          2 * SIZE + 4 * PADDING,
          2 * PADDING,
          SIZE - 32,
          SIZE - 32
        ),
        0,
        0
      ),
      paint
    );
  }, []);
  const onCircleDraw = useDrawCallback((canvas) => {
    const r = SIZE / 2;
    canvas.drawOval(Skia.XYWHRect(16, 16, 2 * SIZE, SIZE), paint);
    canvas.drawCircle(2 * SIZE + 2 * 16 + r, 16 + r, r, paint);
  }, []);
  const onPointsDraw = useDrawCallback((canvas) => {
    canvas.save();
    canvas.translate(-100, 0);
    canvas.drawPoints(PointMode.Points, cubics, strokePaint);
    canvas.restore();
    //const path = Skia.Path.Make();
    //path.addPoly(cubics, true);
    //canvas.drawPath(path, strokePaint);
    canvas.drawPoints(PointMode.Polygon, cubics, strokePaint);
    canvas.drawLine(c.x, c.y, SIZE, 0, strokePaint);
  }, []);
  const onPatchDraw = useDrawCallback((canvas) => {
    const colors = [
      Skia.Color("#61DAFB"),
      Skia.Color("#fb61da"),
      Skia.Color("#61fbcf"),
      Skia.Color("#dafb61"),
    ];
    canvas.drawPatch(cubics, colors, null, null, paint);
  }, []);
  return (
    <ScrollView>
      <Title>Rectangles</Title>
      <SkiaView style={styles.container} onDraw={onRectDraw} />
      <Title>Ovals & Circles</Title>
      <SkiaView style={styles.container} onDraw={onCircleDraw} />
      <Title>Points & Lines</Title>
      <SkiaView style={styles.container} onDraw={onPointsDraw} />
      <Title>Coon Patch</Title>
      <SkiaView style={styles.container} onDraw={onPatchDraw} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: SIZE + 32,
  },
});
