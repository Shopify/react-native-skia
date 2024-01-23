import {
  Canvas,
  Rect,
  Skia,
  Group,
  useTextureValue,
  Image,
  rect,
} from "@shopify/react-native-skia";
import type { SkImage, SkRect } from "@shopify/react-native-skia";
import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Button,
  PixelRatio,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const Increaser = 50;
const size = { width: 25, height: 25 * 0.45 };
const strokeWidth = 2;

export const PerformanceDrawingTest: React.FC = () => {
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
    { width: size.width + strokeWidth, height: size.height + strokeWidth }
  );
  const [numberOfBoxes, setNumberOfBoxes] = useState(150);

  const { width, height } = useWindowDimensions();

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
            5 + ((i * size.width) % width),
            25 + Math.floor(i / (width / size.width)) * size.width,
            size.width,
            size.height
          )
        ),
    [numberOfBoxes, width]
  );

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
          {rects.map((_, i) => (
            <Rct pos={pos} key={i} translation={rects[i]} texture={texture} />
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
  translation: SkRect;
  texture: SharedValue<SkImage | null>;
}

const Rct = ({ pos, texture, translation }: RctProps) => {
  const transform = useDerivedValue(() => {
    const p1 = { x: translation.x, y: translation.y };
    const p2 = pos.value;
    const r = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return [
      { translateX: translation.x },
      { translateY: translation.y },
      { rotate: r },
    ];
  });
  const rct = useDerivedValue(() => {
    return {
      x: 0,
      y: 0,
      width: texture.value?.width() ?? 0 / PixelRatio.get(),
      height: texture.value?.height() ?? 0 / PixelRatio.get(),
    };
  });
  return (
    <Group transform={transform}>
      <Image image={texture} rect={rct} />
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
