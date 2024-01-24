import {
  Canvas,
  Skia,
  Atlas,
  useTextureValue,
  Group,
  rect,
  Rect,
} from "@shopify/react-native-skia";
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Button,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const Increaser = 50;

const size = { width: 25, height: 25 * 0.45 };
const strokeWidth = 2;
const textureSize = {
  width: size.width + strokeWidth,
  height: size.height + strokeWidth,
};

export const PerformanceDrawingTest: React.FC = () => {
  const [numberOfBoxes, setNumberOfBoxes] = useState(300);

  const texture = useTextureValue(
    <Group>
      <Rect
        rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
        color="#00ff00"
      />
      <Rect
        rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
        color="#4060A3"
        style="stroke"
        strokeWidth={strokeWidth}
      />
    </Group>,
    textureSize
  );

  const sprites = useMemo(
    () =>
      new Array(numberOfBoxes)
        .fill(0)
        .map(() => rect(0, 0, textureSize.width, textureSize.height)),
    [numberOfBoxes]
  );

  const { width, height } = useWindowDimensions();

  const pos = useSharedValue<{ x: number; y: number }>({
    x: width / 2,
    y: height * 0.25,
  });

  const buffer = sprites.map(() => Skia.RSXform(1, 0, 0, 0));

  const transforms = useDerivedValue(() => {
    return buffer.map((val, i) => {
      const tx = 5 + ((i * size.width) % width);
      const ty = 25 + Math.floor(i / (width / size.width)) * size.width;
      const r = Math.atan2(pos.value.y - ty, pos.value.x - tx);
      val.set(Math.cos(r), Math.sin(r), tx, ty);
      return val;
    });
  });

  const gesture = Gesture.Pan().onChange((e) => (pos.value = e));

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
        <Canvas style={styles.container} mode="default">
          <Atlas image={texture} sprites={sprites} transforms={transforms} />
        </Canvas>
        <GestureDetector gesture={gesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>
      </View>
    </View>
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
