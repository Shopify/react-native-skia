import React, { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Fill,
  TextPath,
  useFont,
  Skia,
} from "@shopify/react-native-skia";

import { AnimationDemo, Padding } from "./Components";
import {
  useSharedValue,
  Easing,
  withTiming,
  withRepeat,
  useDerivedValue,
} from "react-native-reanimated";

const ExampleHeight = 60;
const Font = require("../../assets/SF-Mono-Semibold.otf");

function useSharedValueThunk(generator, deps) {
  // We may want to add "thunk" support to reanimated's useSharedValue method
  const initial = useMemo(generator, deps);
  return useSharedValue(initial, true);
}

export const AnimateTextOnPath = () => {
  const { width } = useWindowDimensions();

  const font = useFont(Font, 12);

  const path1 = useSharedValueThunk(() => {
    const p1 = Skia.Path.Make();
    p1.moveTo(Padding, ExampleHeight / 2);
    p1.quadTo(
      (width - Padding * 2) / 2,
      ExampleHeight,
      width - Padding * 2,
      ExampleHeight / 2
    );
    p1.simplify();
    return p1;
  }, [width]);

  const path2 = useSharedValueThunk(() => {
    const p2 = Skia.Path.Make();
    p2.moveTo(Padding, ExampleHeight / 2);
    p2.quadTo(
      (width - Padding * 2) / 2,
      0,
      width - Padding * 2,
      ExampleHeight / 2
    );
    p2.simplify();
    return p2;
  }, [width]);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true
    );
  }, []);

  const path = useDerivedValue(() => {
    return path1.value.interpolate(path2.value, progress.value);
  });

  return (
    <AnimationDemo title={"Interpolating text on path."}>
      <Canvas style={styles.canvas}>
        <Fill color="white" />
        {font && (
          <TextPath path={path} font={font} text="Hello World from RN Skia!" />
        )}
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
