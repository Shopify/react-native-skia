import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Path,
  Group,
  useTouchHandler,
  useValue,
  useDerivedValue,
  LinearGradient,
  runDecay,
  dist,
  add,
  vec,
  clamp,
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
  const transition = useValue(0);
  const state = useValue({
    next: 0,
    current: 0,
  });
  const path = useDerivedValue(() => {
    const { current, next } = state.current;
    const start = graphs[current].data.path;
    const end = graphs[next].data.path;
    return end.interpolate(start, transition.current);
  }, [state, transition]);
  const x = useValue(0);
  const c = useDerivedValue(() => {
    const cmds = path.current.toCmds();
    return {
      x: x.current,
      y: getYForX(cmds, x.current) ?? 0,
    };
  }, [x, path]);

  const onTouch = useGraphTouchHandler(x, c);
  return (
    <View style={styles.container}>
      <Header />
      <Canvas
        style={{ width: WIDTH, height: 2 * HEIGHT + 30 }}
        onTouch={onTouch}
      >
        <Label state={state} c={c} />
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
          <Cursor c={c} />
        </Group>
      </Canvas>
      <Selection state={state} transition={transition} />
      <List />
    </View>
  );
};
