import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  Skia,
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
  TwoPointConicalGradient,
  SweepGradient,
  vec,
  Blend,
  Turbulence,
} from "@shopify/react-native-skia";

import { ColorShader } from "../../../package/src/renderer/nodes/shaders/Color";

const { width } = Dimensions.get("window");
const SIZE = width / 2;
const R = SIZE / 2;

const paint = Skia.Paint();
paint.setAntiAlias(true);
const r1 = rect(0, 0, SIZE, SIZE);
const r2 = rect(SIZE, 0, SIZE, SIZE);
const r3 = rect(0, SIZE, SIZE, SIZE);
const r4 = rect(SIZE, SIZE, SIZE, SIZE);
const r5 = rect(0, 2 * SIZE, SIZE, SIZE);

export const Gradients = () => {
  const p1 = usePaintRef();
  const p2 = usePaintRef();
  const p3 = usePaintRef();
  const p4 = usePaintRef();
  const p5 = usePaintRef();
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
        <Paint ref={p3}>
          <TwoPointConicalGradient
            start={vec(R, SIZE)}
            startR={R}
            end={vec(R, R)}
            endR={R}
            colors={["#61DAFB", "#fb61da"]}
          />
        </Paint>
        <Paint ref={p4}>
          <SweepGradient
            c={vec(SIZE + R, SIZE + R)}
            colors={["#61DAFB", "#fb61da", "#dafb61", "#61DAFB"]}
          />
        </Paint>
        <Paint ref={p5}>
          <Blend mode="difference">
            <ColorShader color="#61DAFB" />
            <Turbulence freqX={0.05} freqY={0.05} octaves={4} />
          </Blend>
        </Paint>
        <Rect rect={r1} paint={p1} />
        <Rect rect={r2} paint={p2} />
        <Rect rect={r3} paint={p3} />
        <Rect rect={r4} paint={p4} />
        <Rect rect={r5} paint={p5} />
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
