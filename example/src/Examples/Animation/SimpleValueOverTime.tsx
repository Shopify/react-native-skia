import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  Oval,
  Paint,
  useDerivedValue,
  useTiming,
  vec,
} from "@shopify/react-native-skia";

import { AnimationDemo } from "./Components";

const Size = { width: 200, height: 200 };

export const SimpleValueOverTime = () => {
  const progress = useTiming(
    { to: 1, loop: true, yoyo: true },
    { duration: 250 }
  );

  const { width: scWidth } = useWindowDimensions();
  const { width, height } = Size;

  const center = useMemo(() => vec(width / 2, height / 2), [width, height]);
  const rect = {
    x: 0,
    y: 0,
    width: width,
    height: height,
  };

  const thickness = useDerivedValue((p) => 4 + p * 10, [progress]);

  return (
    <AnimationDemo title={"Simple animation of value over time"}>
      <Canvas style={styles.canvas}>
        <Group
          transform={[
            { translateX: scWidth / 2 - width / 2 },
            { translateY: height / 2 },
          ]}
        >
          <Paint color="#61DAFB" style="fill" />
          <Circle c={center} r={25} />
          <Group>
            <Paint style="stroke" strokeWidth={thickness} color="#61DAFB" />
            <Group
              transform={[{ rotate: Math.PI / 3 }, { scaleX: 0.54 }]}
              origin={center}
            >
              <Oval rect={rect} />
            </Group>
            <Group
              transform={[{ rotate: -Math.PI / 3 }, { scaleX: 0.54 }]}
              origin={center}
            >
              <Oval rect={rect} />
            </Group>
            <Group transform={[{ scaleX: 0.54 }]} origin={center}>
              <Oval rect={rect} />
            </Group>
          </Group>
        </Group>
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 400,
    width: "100%",
    backgroundColor: "#FEFEFE",
  },
});
