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
  Skia,
  Fill,
} from "@shopify/react-native-skia";

import { graphs, PADDING, SIZE } from "./Model";
import { getYForX } from "./Math";
import { Cursor } from "./components/Cursor";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D3758",
  },
});

export const Wallet = () => {
  const graph = graphs[0];
  const { path } = graph.data;
  const cmds = useMemo(() => path.toCmds(), [path]);
  const closedPath = path.copy();
  closedPath.lineTo(path.getLastPt().x, SIZE - PADDING);
  closedPath.lineTo(0, SIZE - PADDING);
  closedPath.close();
  const x = useValue(0);
  const c = useDerivedValue(() => {
    const result = {
      x: x.current,
      y: getYForX(cmds, x.current)! + PADDING,
    };
    return result;
  }, [x, cmds]);
  const onTouch = useTouchHandler({
    onActive: (pt) => {
      x.current = pt.x;
    },
  });
  return (
    <View style={styles.container}>
      <Canvas style={{ width: SIZE, height: SIZE }} onTouch={onTouch}>
        <Fill color="#405073" />
        <Group transform={[{ translateY: PADDING }]}>
          <Path path={closedPath}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, SIZE)}
              positions={[0, 0.9]}
              colors={["rgba(183, 255, 255, 0.6)", "rgba(183, 255, 255, 0)"]}
            />
          </Path>
          <Path
            style="stroke"
            path={path}
            strokeWidth={4}
            strokeJoin="round"
            strokeCap="round"
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(SIZE, 0)}
              colors={["#3FFFF2"]}
            />
          </Path>
          <Cursor c={c} />
        </Group>
      </Canvas>
    </View>
  );
};
