import React, { useMemo } from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Canvas,
  Spring,
  Value,
  useLoop,
  Timeline,
} from "@shopify/react-native-skia";
import { createSpring } from "@shopify/react-native-skia/src/animation/Animation/functions";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const StaggeredTimelineAnimation = () => {
  const values = useMemo(
    () =>
      new Array(Math.round((width - Size) / (Size * 1.5)))
        .fill(0)
        .map(() => Value.create(0)),
    []
  );

  useLoop(
    Timeline.create((tl) => {
      tl.stagger(
        values.map(() =>
          createSpring({ from: 0, to: 1 }, Spring.Config.Wobbly)
        ),
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
