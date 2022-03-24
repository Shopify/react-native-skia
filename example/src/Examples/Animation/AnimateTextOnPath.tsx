import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Easing,
  Fill,
  Skia,
  TextPath,
  useDerivedValue,
  usePath,
  useLoop,
} from "@shopify/react-native-skia";

import { AnimationDemo, Padding } from "./Components";

// Load font
const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle("helvetica");
if (!typeface) {
  throw new Error("Helvetica not found");
}
const font = Skia.Font(typeface, 14);

const ExampleHeight = 60;

export const AnimateTextOnPath = () => {
  const { width } = useWindowDimensions();

  // Create a progress going from 0..1 and back
  const progress = useLoop({
    duration: 700,
    easing: Easing.inOut(Easing.cubic),
  });

  // Create the start path
  const path1 = usePath((p) => {
    p.moveTo(Padding, ExampleHeight / 2);
    p.quadTo(
      (width - Padding * 2) / 2,
      ExampleHeight,
      width - Padding * 2,
      ExampleHeight / 2
    );
    p.simplify();
  });

  // Create the end path
  const path2 = usePath((p) => {
    p.moveTo(Padding, ExampleHeight / 2);
    p.quadTo(
      (width - Padding * 2) / 2,
      0,
      width - Padding * 2,
      ExampleHeight / 2
    );
    p.simplify();
  });

  // Create a derived value that interpolates between
  // the start and end path
  const path = useDerivedValue(
    () => path1.interpolate(path2, progress.current),
    [progress]
  );

  return (
    <AnimationDemo title={"Interpolating text on path."}>
      <Canvas style={styles.canvas}>
        <Fill color="white" />
        <TextPath path={path} font={font} text="Hello World from RN Skia!" />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: ExampleHeight,
    width: "100%",
    backgroundColor: "#FEFEFE",
  },
});
