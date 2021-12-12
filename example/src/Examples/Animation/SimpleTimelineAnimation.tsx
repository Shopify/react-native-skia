import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Canvas,
  useValue,
  useLoop,
  Timeline,
} from "@shopify/react-native-skia";
import { createTiming } from "@shopify/react-native-skia/src/animation/Animation/functions";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const SimpleTimelineAnimation = () => {
  const x = useValue(0);
  const y = useValue(0);
  useLoop(
    Timeline.create((tl) => {
      tl.add(createTiming({ from: 0, to: 1, duration: 1000 }), x);
      tl.add(createTiming({ from: 0, to: 1, duration: 300 }), y);
      tl.add(createTiming({ from: 1, to: 0, duration: 1000 }), x);
      tl.add(createTiming({ from: 1, to: 0, duration: 300 }), y);
    }),
    { yoyo: false }
  );

  return (
    <AnimationDemo
      title={"Simple timeline animation with sequenced animations"}
    >
      <Canvas style={styles.canvas}>
        <AnimationElement
          x={({ width: w }) => x.value * (w - Size)}
          y={({ height: h }) => y.value * (h - Size)}
        />
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
