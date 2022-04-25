import React, { useMemo } from "react";
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
} from "@shopify/react-native-skia";

import { graphs, PADDING, WIDTH, HEIGHT, COLORS } from "./Model";
import { getYForX } from "./Math";
import { Cursor } from "./components/Cursor";

const titleFont = Skia.Font(
  Skia.FontMgr.RefDefault().matchFamilyStyle("helvetica")!,
  64
);

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
  const gestureActive = useValue(false);
  const offsetX = useValue(0);
  const x = useValue(0);
  const c = useDerivedValue(() => {
    const result = {
      x: x.current,
      y: getYForX(cmds, x.current) ?? 0,
    };
    return result;
  }, [x, cmds]);
  const text = "$5,021";
  const titlePos = titleFont.measureText(text);
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
  const start = path.getPoint(0);
  const end = path.getLastPt();
  return (
    <View style={styles.container}>
      <Canvas
        style={{ width: WIDTH, height: 2 * HEIGHT + 30 }}
        onTouch={onTouch}
      >
        <Text
          x={WIDTH / 2 - titlePos.width / 2}
          y={translateY - 100}
          text={text}
          font={titleFont}
          color="white"
        />
        <Group transform={[{ translateY }]}>
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
