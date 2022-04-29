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
  Skia,
  Text,
  interpolate,
} from "@shopify/react-native-skia";

import { graphs, PADDING, WIDTH, HEIGHT, COLORS } from "./Model";
import { getYForX } from "./Math";
import { Cursor } from "./components/Cursor";
import { Selection } from "./components/Selection";
import { List } from "./components/List";
import { Header } from "./components/Header";
import { Label } from "./components/Label";

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
  const cmds = useDerivedValue(() => path.current.toCmds(), [path]);
  const gestureActive = useValue(false);
  const offsetX = useValue(0);
  const x = useValue(0);
  const c = useDerivedValue(() => {
    const result = {
      x: x.current,
      y: getYForX(cmds.current, x.current) ?? 0,
    };
    return result;
  }, [x, cmds]);

  const translateY = HEIGHT + PADDING;
  const onTouch = useTouchHandler({
    onStart: (pos) => {
      const normalizedCenter = add(c.current, vec(0, translateY));
      if (dist(normalizedCenter, pos) < 50) {
        gestureActive.current = true;
        offsetX.current = x.current - pos.x;
      }
    },
    onActive: (pos) => {
      if (gestureActive.current) {
        x.current = clamp(offsetX.current + pos.x, 0, WIDTH);
      }
    },
    onEnd: ({ velocityX }) => {
      if (gestureActive.current) {
        gestureActive.current = false;
        runDecay(x, { velocity: velocityX, clamp: [0, WIDTH] });
      }
    },
  });
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
