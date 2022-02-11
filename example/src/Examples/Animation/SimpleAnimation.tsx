import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Fill,
  Rect,
  useDerivedValue,
  useTimestamp,
} from "@shopify/react-native-skia";

import { AnimationDemo, Padding, Size } from "./Components";

export const SimpleAnimation = () => {
  const { width } = useWindowDimensions();
  const timestamp = useTimestamp();
  const normalized = useDerivedValue((t) => (t / 1000) % 1.0, [timestamp]);
  const rect = useDerivedValue(
    (p) => ({ x: 0, y: 30, width: p * width, height: Size }),
    [normalized]
  );
  return (
    <AnimationDemo title={"Basic animation with derived values"}>
      <Canvas style={styles.canvas}>
        <Fill color="white" />
        <Rect rect={rect} color="#8556E5" />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 80,
    width: "100%",
    backgroundColor: "#FEFEFE",
  },
});
