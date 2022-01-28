import type { IPath } from "@shopify/react-native-skia";
import {
  Line,
  Canvas,
  Circle,
  Fill,
  LinearGradient,
  Paint,
  Path,
  useTouchHandler,
  useValue,
  Text as SkiaText,
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

  const progress = useValue(
    getPointAtPositionInPath(width / 2, width, 60, path)
  );

  const touchHandler = useTouchHandler({
    onActive: ({ x }) =>
      (progress.value = getPointAtPositionInPath(x, width, 60, path)),
  });

  return (
    <View style={{ height, marginBottom: 10 }}>
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
        <Circle c={() => progress.value} r={10} />
        <Circle color="#DA4167" c={() => progress.value} r={7.5} />
        <SkiaText
          familyName="Arial"
          size={12}
          x={() => progress.value.x - 24}
          y={() => progress.value.y - 18}
          value={() => "$ " + progress.value.x.toFixed(2)}
        />
        <Line
          p1={() => vec(progress.value.x, progress.value.y + 14)}
          p2={() => vec(progress.value.x, height)}
        />
      </Canvas>
      <Text>Touch and drag to move center point</Text>
    </View>
  );
};

const getPointAtPositionInPath = (
  x: number,
  width: number,
  steps: number,
  path: IPath
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
