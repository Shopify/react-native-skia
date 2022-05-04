import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Path,
  Group,
  useValue,
  useDerivedValue,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";

import { graphs, PADDING, WIDTH, HEIGHT, COLORS } from "./Model";
import { getYForX } from "./Math";
import { Cursor } from "./components/Cursor";
import { Selection } from "./components/Selection";
import { List } from "./components/List";
import { Header } from "./components/Header";
import { Label } from "./components/Label";
import { useGraphTouchHandler } from "./components/useGraphTouchHandler";

const translateY = HEIGHT + PADDING;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1D2B",
  },
});

export const Wallet = () => {
  // animation value to transition from one graph to the next
  const transition = useValue(0);
  // indicices of the current and next graphs
  const state = useValue({
    next: 0,
    current: 0,
  });
  // path to display
  const path = useDerivedValue(() => {
    const { current, next } = state.current;
    const start = graphs[current].data.path;
    const end = graphs[next].data.path;
    return end.interpolate(start, transition.current);
  }, [state, transition]);
  // x and y values of the cursor
  const x = useValue(0);
  const y = useDerivedValue(
    () => getYForX(path.current.toCmds(), x.current)!,
    [x, path]
  );
  const onTouch = useGraphTouchHandler(x, y);
  return (
    <View style={styles.container}>
      <Header />
      <Canvas
        style={{ width: WIDTH, height: 2 * HEIGHT + 30 }}
        onTouch={onTouch}
      >
        <Label state={state} y={y} />
        <Group transform={[{ translateY }]}>
          <Path
            style="stroke"
            path={path}
            strokeWidth={4}
            strokeJoin="round"
            strokeCap="round"
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(WIDTH, 0)}
              colors={COLORS}
            />
          </Path>
          <Cursor x={x} y={y} />
        </Group>
      </Canvas>
      <Selection state={state} transition={transition} />
      <List />
    </View>
  );
};
