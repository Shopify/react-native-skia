import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  Skia,
  useDrawCallback,
  BlendMode,
  TileMode,
  vec,
  rect,
  Canvas,
  Rect,
  usePaintRef,
  LinearGradient,
  Paint,
  topLeft,
  bottomRight,
  center,
  RadialGradient,
  RuntimeEffect,
} from "@shopify/react-native-skia";

const { width } = Dimensions.get("window");
const SIZE = width / 2;

const paint = Skia.Paint();
paint.setAntiAlias(true);
const r1 = rect(0, 0, SIZE, SIZE);
const r2 = rect(SIZE, 0, SIZE, SIZE);
const r3 = rect(0, SIZE, SIZE, SIZE);
const r4 = rect(SIZE, SIZE, SIZE, SIZE);
const r5 = rect(0, 2 * SIZE, SIZE, SIZE);
const r6 = rect(SIZE, 2 * SIZE, SIZE, SIZE);

export const Gradients = () => {
  const onGradientDraw = useDrawCallback((canvas) => {
    // 3. Two Point Canonical
    const r3 = rect(0, SIZE, SIZE, SIZE);
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

  const p1 = usePaintRef();
  const p2 = usePaintRef();
  const p6 = usePaintRef();
  return (
    <ScrollView>
      <Canvas style={styles.container}>
        <Paint ref={p1}>
          <LinearGradient
            start={topLeft(r1)}
            end={bottomRight(r1)}
            colors={["#61DAFB", "#fb61da"]}
          />
        </Paint>
        <Paint ref={p2}>
          <RadialGradient
            c={center(r2)}
            r={SIZE / 2}
            colors={["#fb61da", "#61DAFB"]}
          />
        </Paint>
        <Paint ref={p6} />
        <Rect rect={r1} paint={p1} />
        <Rect rect={r2} paint={p2} />
        <Rect rect={r3} />
        <Rect rect={r4} />
        <Rect rect={r5} />
        <Rect rect={r6} paint={p6} />
      </Canvas>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE * 2,
    height: SIZE * 4,
  },
});
