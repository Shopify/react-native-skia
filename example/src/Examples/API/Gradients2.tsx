import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  Skia,
  rect,
  Canvas,
  Rect,
  LinearGradient,
  Paint,
  topLeft,
  bottomRight,
  center,
  RadialGradient,
  TwoPointConicalGradient,
  SweepGradient,
  vec,
  Turbulence,
  ColorShader,
  BlendShader,
} from "@shopify/react-native-skia";

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
  return (
    <ScrollView>
      <Canvas style={styles.container}>
        <Paint>
          <LinearGradient
            start={topLeft(r1)}
            end={bottomRight(r1)}
            colors={["#61DAFB", "#fb61da"]}
          />
        </Paint>
        <Rect rect={r1} />
        <Paint>
          <RadialGradient
            c={center(r2)}
            r={SIZE / 2}
            colors={["#fb61da", "#61DAFB"]}
          />
        </Paint>
        <Rect rect={r2} />
        <Paint>
          <TwoPointConicalGradient
            start={vec(R, SIZE)}
            startR={R}
            end={vec(R, R)}
            endR={R}
            colors={["#61DAFB", "#fb61da"]}
          />
        </Paint>
        <Rect rect={r3} />
        <Paint>
          <SweepGradient
            c={vec(SIZE + R, SIZE + R)}
            colors={["#61DAFB", "#fb61da", "#dafb61", "#61DAFB"]}
          />
        </Paint>
        <Rect rect={r4} />
        <Paint>
          <BlendShader mode="difference">
            <ColorShader color="#61DAFB" />
            <Turbulence freqX={0.05} freqY={0.05} octaves={4} />
          </BlendShader>
        </Paint>
        <Rect rect={r5} />
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
