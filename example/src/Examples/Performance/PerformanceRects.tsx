import {
  Canvas,
  Rect,
  Skia,
  Group,
  select,
  getSelectorsForValue,
} from "@shopify/react-native-skia";
import type { SkRect } from "@shopify/react-native-skia";
import React, { useEffect, useMemo, useState } from "react";
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
  useAnimatedReaction,
} from "react-native-reanimated";

const Size = 25;
const Increaser = 50;

export const PerformanceDrawingTest: React.FC = () => {
  const [numberOfBoxes, setNumberOfBoxes] = useState(100);

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

  const gesture = Gesture.Pan().onChange((e) => (pos.value = e));
  const rotations = useDerivedValue(() => {
    return rects.map((rct) => {
      const p1 = { x: rct.x, y: rct.y };
      const p2 = pos.value;
      const r = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      return r;
    });
  });
  // useAnimatedReaction(
  //   () => pos.value,
  //   (val) => {
  //     getSelectorsForValue().map((s) => s());
  //     // selectors[1].map((selector) => {
  //     //   console.log({ selector });
  //     //   selector(val);
  //     // });
  //   }
  // );
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
            <Rct rotations={rotations} index={i} key={i} rct={rects[i]} />
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
  rotations: SharedValue<number[]>;
  index: number;
  rct: SkRect;
}

const Rct = ({ rotations, index, rct }: RctProps) => {
  return (
    <Group
      transform={select(rotations, (values) => {
        "worklet";
        return [{ rotate: values[index] }];
      })}
      origin={rct}
    >
      <Rect rect={rct} color="#00ff00" />
      <Rect rect={rct} color="#4060A3" style="stroke" strokeWidth={2} />
    </Group>
  );
};

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
