import { Canvas, Rect, Skia, Group } from "@shopify/react-native-skia";
import type { Node, SkRect } from "@shopify/react-native-skia";
import { useAnimatedReaction } from "@shopify/react-native-skia/src/external/reanimated/moduleWrapper";
import type { RefObject } from "react";
import React, { forwardRef, useMemo, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Button,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const Size = 25;
const Increaser = 50;

export const PerformanceDrawingTest: React.FC = () => {
  const [numberOfBoxes, setNumberOfBoxes] = useState(450);

  const { width, height } = useWindowDimensions();

  const SizeWidth = Size;
  const SizeHeight = Size * 0.45;

  const pos = useSharedValue<{ x: number; y: number }>({
    x: width / 2,
    y: height * 0.25,
  });

  const rects = useMemo(
    () =>
      new Array(numberOfBoxes)
        .fill(0)
        .map((_, i) =>
          Skia.XYWHRect(
            5 + ((i * Size) % width),
            25 + Math.floor(i / (width / Size)) * Size,
            SizeWidth,
            SizeHeight
          )
        ),
    [numberOfBoxes, width, SizeWidth, SizeHeight]
  );
  const refs = useMemo(() => rects.map(() => React.createRef()), [rects]);
  const gesture = Gesture.Pan().onChange((e) => (pos.value = e));

  useAnimatedReaction(
    () => pos.value,
    (val) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refs.forEach((ref: RefObject<Node<any>>, i) => {
        const rct = rects[i];
        const p2 = val;
        const r = Math.atan2(p2.y - rct.y, p2.x - rct.x);
        if (ref.current) {
          ref.current!.setProps({
            transform: [{ rotate: r }],
            origin: rct,
          });
        }
      });
    }
  );

  return (
    <View style={styles.container}>
      <View style={styles.mode}>
        <View style={styles.panel}>
          <Button
            title="⬇️"
            onPress={() => setNumberOfBoxes((n) => Math.max(0, n - Increaser))}
          />
          <Text>&nbsp;Size&nbsp;</Text>
          <Text>{numberOfBoxes}</Text>
          <Text>&nbsp;</Text>
          <Button
            title="⬆️"
            onPress={() => setNumberOfBoxes((n) => n + Increaser)}
          />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Canvas style={styles.container} mode="continuous">
          {rects.map((_, i) => (
            <Rct pos={pos} key={i} rct={rects[i]} ref={refs[i]} />
          ))}
        </Canvas>
        <GestureDetector gesture={gesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>
      </View>
    </View>
  );
};

interface RctProps {
  pos: SharedValue<{ x: number; y: number }>;
  rct: SkRect;
}

const Rct = forwardRef(({ pos, rct }: RctProps, ref) => {
  return (
    <Group ref={ref}>
      <Rect rect={rct} color="#00ff00" />
      <Rect rect={rct} color="#4060A3" style="stroke" strokeWidth={2} />
    </Group>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mode: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panel: {
    flexDirection: "row",
    alignItems: "center",
  },
});
