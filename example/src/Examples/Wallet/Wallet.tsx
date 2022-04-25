import React, { useMemo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  Canvas,
  Path,
  Group,
  useTouchHandler,
  useValue,
  useDerivedValue,
  LinearGradient,
} from "@shopify/react-native-skia";

import { graphs, PADDING, WIDTH, HEIGHT, COLORS } from "./Model";
import { getYForX } from "./Math";
import { Cursor } from "./components/Cursor";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1D2B",
  },
});

export const Wallet = () => {
  const graph = graphs[0];
  const { path } = graph.data;
  const cmds = useMemo(() => path.toCmds(), [path]);
  const x = useValue(0);
  const c = useDerivedValue(() => {
    const result = {
      x: x.current,
      y: getYForX(cmds, x.current)!,
    };
    return result;
  }, [x, cmds]);
  const onTouch = useTouchHandler({
    onActive: (pt) => {
      x.current = pt.x;
    },
  });
  const start = path.getPoint(0);
  const end = path.getLastPt();
  return (
    <View style={styles.container}>
      <Canvas style={{ width: WIDTH, height: 2 * HEIGHT }} onTouch={onTouch}>
        <Group transform={[{ translateY: HEIGHT + PADDING }]}>
          <Path
            style="stroke"
            path={path}
            strokeWidth={4}
            strokeJoin="round"
            strokeCap="round"
          >
            <LinearGradient start={start} end={end} colors={COLORS} />
          </Path>
          <Cursor c={c} start={start} end={end} />
        </Group>
      </Canvas>
    </View>
  );
};
