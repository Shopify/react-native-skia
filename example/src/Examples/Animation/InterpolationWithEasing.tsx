import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Easing,
  Fill,
  useTiming,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

export const InterpolationWithEasing = () => {
  const { width } = useWindowDimensions();
  // Create timing animation that loops forever
  const progress = useTiming(
    {
      from: 20,
      to: width - (Size + Padding),
      loop: true,
      yoyo: true,
    },
    { duration: 1000, easing: Easing.inOut(Easing.cubic) }
  );
  return (
    <AnimationDemo title={"Interpolating value using an easing"}>
      <Canvas style={styles.canvas}>
        <Fill color="white" />
        <Circle cx={progress} cy={20} r={15} color="#DC4C4C" />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 40,
    width: "100%",
    backgroundColor: "#FEFEFE",
  },
});
