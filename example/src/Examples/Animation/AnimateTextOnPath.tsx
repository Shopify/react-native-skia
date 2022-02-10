import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Easing,
  Path,
  Skia,
  TextPath,
  useDerivedValue,
  usePath,
  useTiming,
} from "@shopify/react-native-skia";

import { AnimationDemo, Padding } from "./Components";

// Load font
const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle("helvetica");
if (!typeface) {
  throw new Error("Helvetica not found");
}
const font = Skia.Font(typeface, 30);

const ExampleHeight = 160;

export const AnimateTextOnPath = () => {
  const { width } = useWindowDimensions();
  const progress = useTiming(
    { loop: true, yoyo: true },
    { duration: 700, easing: Easing.inOut(Easing.cubic) }
  );

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

  const path = useDerivedValue(
    (p) => {
      if (p > 1.0 || p < 0) {
        console.log(p.toFixed(4));
      }
      return path1.interpolate(path2, p);
    },
    [progress]
  );

  return (
    <AnimationDemo title={"Interpolating text on path."}>
      <Canvas style={styles.canvas}>
        <TextPath path={path} font={font} text="Hello World from RN Skia!" />
        <Path path={path} color="red" style="stroke" />
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
