import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Blur,
  Canvas,
  Circle,
  Fill,
  Group,
  Paint,
  usePaintRef,
  polar2Canvas,
  vec,
} from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");
const center = vec(width / 2, height / 2 - 64);
const c1 = "#61bea2";
const c2 = "#529ca0";
const R = width / 4;

export const Breathe = () => {
  const paint = usePaintRef();
  // blur = interpolate(progress.value, [0, 0.5, 1], [0, 45, 30])
  return (
    <Canvas style={styles.container}>
      <Paint ref={paint}>
        <Blur sigma={40} style="normal" />
      </Paint>
      <Fill color="#242b38" />
      {new Array(6).fill(0).map((_, i) => {
        const theta = (i * (2 * Math.PI)) / 6;
        const { x, y } = polar2Canvas({ theta, radius: R }, center);
        return (
          <Group key={i} transform={[{ translateX: x }, { translateY: y }]}>
            <Circle
              cx={0}
              cy={0}
              r={R}
              opacity={1}
              color={i % 2 === 0 ? c1 : c2}
              blendMode="screen"
            />
          </Group>
        );
      })}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
