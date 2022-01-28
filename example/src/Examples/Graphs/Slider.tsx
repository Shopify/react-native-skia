import {
  Canvas,
  Circle,
  Fill,
  LinearGradient,
  Paint,
  Path,
  useTouchHandler,
  useValue,
  vec,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { createGraphPath } from "./createGraphPath";
import type { GraphProps } from "./types";

export const Slider: React.FC<GraphProps> = ({ height, width }) => {
  const path = useMemo(
    () => createGraphPath(width, height, 60, false),
    [height, width]
  );

  const progress = useValue(width / 2);

  const touchHandler = useTouchHandler({
    onActive: ({ x }) => (progress.value = Math.max(1, Math.min(width, x))),
  });

  return (
    <View style={{ height }}>
      <Canvas style={styles.graph} onTouch={touchHandler}>
        <Fill color="black" />
        <Paint>
          <LinearGradient
            start={vec(0, height * 0.5)}
            end={vec(width * 0.5, height * 0.5)}
            colors={["black", "#DA4167"]}
          />
        </Paint>
        <Path
          path={path}
          strokeWidth={4}
          style="stroke"
          strokeJoin="round"
          strokeCap="round"
        />
        <Paint color="#fff" />
        <Circle
          cx={() => progress.value - 5}
          cy={() => path.getPoint(Math.round(progress.value / (width / 60))).y}
          r={10}
        />
        <Circle
          color="#DA4167"
          cx={() => progress.value - 5}
          cy={() => path.getPoint(Math.round(progress.value / (width / 60))).y}
          r={7.5}
        />
      </Canvas>
      <Text>Touch and drag to move center point</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  graph: {
    flex: 1,
  },
});
