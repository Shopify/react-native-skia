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
  interpolate,
} from "@shopify/react-native-skia";

import type { GraphIndex } from "./Model";
import { graphs, PADDING, WIDTH, HEIGHT, COLORS, AJUSTED_SIZE } from "./Model";
import { getYForX } from "./Math";
import { Cursor } from "./components/Cursor";
import { Selection } from "./components/Selection";
import { List } from "./components/List";
import { Header } from "./components/Header";

const tf = Skia.FontMgr.RefDefault().matchFamilyStyle("helvetica")!;
const titleFont = Skia.Font(tf, 64);
const subtitleFont = Skia.Font(tf, 24);

const currency = new Intl.NumberFormat("en-EN", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  style: "currency",
  currency: "USD",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1D2B",
  },
});

export const Wallet = () => {
  const current = useValue(0);
  const graph = useDerivedValue(() => graphs[current.current], [current]);
  const path = useDerivedValue(() => graph.current.data.path, [graph]);
  const cmds = useDerivedValue(() => graph.current.data.path.toCmds(), [graph]);
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
  const text = useDerivedValue(() => {
    return currency.format(
      interpolate(
        c.current.y,
        [0, AJUSTED_SIZE],
        [graph.current.data.maxPrice, graph.current.data.minPrice]
      )
    );
  }, [c]);
  const subtitle = "+ $314,15";
  const titleX = useDerivedValue(
    () =>
      WIDTH / 2 -
      titleFont.measureText(currency.format(graph.current.data.maxPrice))
        .width /
        2,
    [graph]
  );
  const subtitlePos = subtitleFont.measureText(subtitle);
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
  const start = useDerivedValue(() => path.current.getPoint(0), [path]);
  const end = useDerivedValue(() => path.current.getLastPt(), [path]);
  return (
    <View style={styles.container}>
      <Header />
      <Canvas
        style={{ width: WIDTH, height: 2 * HEIGHT + 30 }}
        onTouch={onTouch}
      >
        <Text
          x={titleX}
          y={translateY - 120}
          text={text}
          font={titleFont}
          color="white"
        />
        <Text
          x={WIDTH / 2 - subtitlePos.width / 2}
          y={translateY - 60}
          text={subtitle}
          font={subtitleFont}
          color="#8E8E93"
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
      <Selection onPress={(index) => (current.current = index)} />
      <List />
    </View>
  );
};
