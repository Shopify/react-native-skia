import React, { useMemo } from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Canvas,
  Spring,
  useValue,
  Value,
  useLoop,
  Timeline,
} from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const StaggeredTimelineAnimation = () => {
  const progress = useValue(0);
  const values = useMemo(
    () =>
      new Array(Math.round((width - Size) / (Size * 1.5)))
        .fill(0)
        .map(() => Value.create(0)),
    []
  );

  useLoop(
    progress,
    Timeline.create((tl) => {
      tl.stagger(
        values.map(() => Spring.create({ from: 0, to: 1 }, Spring.Wobbly())),
        values,
        {
          each: 50,
          from: "center",
        }
      );
    }),
    { yoyo: true }
  );

  return (
    <AnimationDemo title={"Timeline animation with staggered animations"}>
      <Canvas style={styles.canvas}>
        {values.map((v, i) => (
          <AnimationElement
            key={i}
            x={i * Size * 1.5}
            y={({ height: h }) => v.value * (h - Size)}
          />
        ))}
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 80,
    width: width - Padding,
    backgroundColor: "#FEFEFE",
  },
});
