import type { SkPath } from "@shopify/react-native-skia";
import {
  useFont,
  Group,
  useComputedValue,
  useValue,
  Line,
  Canvas,
  Circle,
  Fill,
  LinearGradient,
  Path,
  useTouchHandler,
  Text as SkiaText,
  vec,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { createGraphPath } from "./createGraphPath";
import type { GraphProps } from "./types";

export const Slider: React.FC<GraphProps> = ({ height, width }) => {
  const font = useFont(require("../../assets/SF-Pro-Display-Bold.otf"), 17);
  const path = useMemo(
    () => createGraphPath(width, height, 60, false),
    [height, width]
  );

  const touchPos = useValue(
    getPointAtPositionInPath(width / 2, width, 60, path)
  );

  const touchHandler = useTouchHandler({
    onActive: ({ x }) =>
      (touchPos.current = getPointAtPositionInPath(x, width, 60, path)),
  });

  const label = useComputedValue(
    () =>
      "$ " + (touchPos.current ? (touchPos.current.y * -1).toFixed(2) : "-"),
    [touchPos]
  );

  const textX = useComputedValue(() => touchPos.current.x - 24, [touchPos]);
  const textY = useComputedValue(() => touchPos.current.y - 18, [touchPos]);
  const lineP1 = useComputedValue(
    () => vec(touchPos.current.x, touchPos.current.y + 14),
    [touchPos]
  );
  const lineP2 = useComputedValue(
    () => vec(touchPos.current.x, height),
    [touchPos]
  );

  if (font === null) {
    return null;
  }
  return (
    <View style={{ height, marginBottom: 10 }}>
      <Canvas style={styles.graph} onTouch={touchHandler}>
        <Fill color="black" />
        <Path
          path={path}
          strokeWidth={4}
          style="stroke"
          strokeJoin="round"
          strokeCap="round"
        >
          <LinearGradient
            start={vec(0, height * 0.5)}
            end={vec(width * 0.5, height * 0.5)}
            colors={["black", "#DA4167"]}
          />
        </Path>
        <Group color="#fff">
          <Circle c={touchPos} r={10} />
          <Circle color="#DA4167" c={touchPos} r={7.5} />
          <SkiaText font={font} x={textX} y={textY} text={label} />
          <Line p1={lineP1} p2={lineP2} />
        </Group>
      </Canvas>
      <Text>Touch and drag to move center point</Text>
    </View>
  );
};

const getPointAtPositionInPath = (
  x: number,
  width: number,
  steps: number,
  path: SkPath
) => {
  const index = Math.max(0, Math.floor(x / (width / steps)));
  const fraction = (x / (width / steps)) % 1;
  const p1 = path.getPoint(index);
  if (index < path.countPoints() - 1) {
    const p2 = path.getPoint(index + 1);
    // Interpolate between p1 and p2
    return {
      x: p1.x + (p2.x - p1.x) * fraction,
      y: p1.y + (p2.y - p1.y) * fraction,
    };
  }
  return p1;
};

const styles = StyleSheet.create({
  graph: {
    flex: 1,
  },
});
