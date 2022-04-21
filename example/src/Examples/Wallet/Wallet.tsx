import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Path,
  Group,
  useTouchHandler,
  useValue,
  vec,
  Circle,
  Shadow,
  useDerivedValue,
  Line,
  LinearGradient,
  DashPathEffect,
} from "@shopify/react-native-skia";

import { graphs, PADDING, SIZE } from "./Model";
import { getYForX } from "./Math";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export const Wallet = () => {
  const graph = graphs[0];
  const { path } = graph.data;
  const cmds = useMemo(() => path.toCmds(), [path]);
  const x = useValue(0);
  const c = useDerivedValue(
    () => ({
      x: x.current,
      y: getYForX(cmds, x.current)! + PADDING,
    }),
    [x, cmds]
  );
  const p1 = useDerivedValue(() => vec(x.current, 0), [x]);
  const p2 = useDerivedValue(() => vec(x.current, SIZE), [x]);
  const positions = useDerivedValue(
    () => [0, x.current / SIZE, x.current / SIZE, 1],
    [x]
  );
  const onTouch = useTouchHandler({
    onActive: (pt) => {
      x.current = pt.x;
    },
  });
  return (
    <View style={styles.container}>
      <Canvas style={{ width: SIZE, height: SIZE }} onTouch={onTouch}>
        <Group transform={[{ translateY: PADDING }]}>
          <Path
            style="stroke"
            color="lightblue"
            path={path}
            strokeWidth={5}
            strokeJoin="round"
            strokeCap="round"
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(SIZE, 0)}
              colors={["#72bcd4", "lightblue", "#e8f4f8", "#e8f4f8"]}
              positions={positions}
            />
          </Path>
        </Group>
        <Line
          p1={p1}
          p2={p2}
          color="lightgray"
          style="stroke"
          strokeWidth={2}
          strokeCap="round"
        >
          <DashPathEffect intervals={[6, 6]} />
        </Line>
        <Group>
          <Circle c={c} r={12} color="white">
            <Shadow dx={0} dy={0} color="rgba(0, 0, 0, 0.3)" blur={4} />
          </Circle>
          <Circle c={c} r={7} color="lightblue" />
        </Group>
      </Canvas>
    </View>
  );
};
