import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  Skia,
  useDrawCallback,
  SkiaView,
  BlendMode,
  TileMode,
} from "@shopify/react-native-skia";

const { width } = Dimensions.get("window");
const SIZE = width / 2;

const paint = Skia.Paint();
paint.setAntiAlias(true);

export const Gradients = () => {
  const onGradientDraw = useDrawCallback((canvas) => {
    // 1. Linear Gradient
    const r1 = Skia.XYWHRect(0, 0, SIZE, SIZE);
    const p1 = paint.copy();
    const colors = [Skia.Color("#61DAFB"), Skia.Color("#fb61da")];
    p1.setShader(
      Skia.Shader.MakeLinearGradient(
        Skia.Point(0, 0),
        Skia.Point(SIZE, SIZE),
        colors,
        null,
        TileMode.Decal
      )
    );
    canvas.drawRect(r1, p1);

    // 2. Radial Gradient
    const r2 = Skia.XYWHRect(SIZE, 0, SIZE, SIZE);
    const p2 = paint.copy();
    p2.setShader(
      Skia.Shader.MakeRadialGradient(
        Skia.Point(SIZE + SIZE / 2, SIZE / 2),
        SIZE / 2,
        colors.reverse(),
        null,
        TileMode.Decal
      )
    );
    canvas.drawRect(r2, p2);

    // 3. Two Point Canonical
    const r3 = Skia.XYWHRect(0, SIZE, SIZE, SIZE);
    const p3 = paint.copy();
    const R = SIZE / 2;
    p3.setShader(
      Skia.Shader.MakeTwoPointConicalGradient(
        Skia.Point(R, SIZE),
        R,
        Skia.Point(R, SIZE),
        SIZE / 4,
        colors.reverse(),
        null,
        TileMode.Clamp
      )
    );
    canvas.drawRect(r3, p3);

    // 4. Angular Gradient
    const r4 = Skia.XYWHRect(SIZE, SIZE, SIZE, SIZE);
    const p4 = paint.copy();
    const sweepColors = [
      Skia.Color("#61DAFB"),
      Skia.Color("#fb61da"),
      Skia.Color("#dafb61"),
      Skia.Color("#61DAFB"),
    ];
    p4.setShader(
      Skia.Shader.MakeSweepGradient(
        SIZE + R,
        SIZE + R,
        sweepColors,
        null,
        TileMode.Clamp
      )
    );
    canvas.drawRect(r4, p4);

    // 5. Turbulence
    const r5 = Skia.XYWHRect(0, 2 * SIZE, SIZE, SIZE);
    const p5 = paint.copy();
    // p5.setColor(Skia.Color("#61DAFB"));
    const one = Skia.Shader.MakeSweepGradient(
      R,
      2 * SIZE + R,
      sweepColors,
      null,
      TileMode.Clamp
    );
    const two = Skia.Shader.MakeTurbulence(0.05, 0.05, 4, 0, 0, 0);
    p5.setShader(Skia.Shader.MakeBlend(BlendMode.Difference, one, two));
    canvas.drawRect(r5, p5);
  }, []);

  return (
    <ScrollView>
      <SkiaView style={styles.container} onDraw={onGradientDraw} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE * 2,
    height: SIZE * 4,
  },
});
