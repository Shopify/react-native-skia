import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Atlas,
  Canvas,
  Group,
  Rect,
  rect,
  useRectBuffer,
  useRSXformBuffer,
  useTexture,
} from "@shopify/react-native-skia";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const TILE = 32;
const COLUMNS = 12;
const ROWS = 16;
const SPRITES = COLUMNS * ROWS;

export const AtlasBuffersRepro = () => {
  const ticker = useSharedValue(0);

  useEffect(() => {
    ticker.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 2400,
        easing: Easing.linear,
      }),
      -1,
      true
    );
  }, [ticker]);

  const texture = useTexture(
    <Group>
      <Rect rect={rect(0, 0, TILE, TILE)} color="#222" />
      <Rect rect={rect(2, 2, TILE - 4, TILE - 4)} color="#53D8FB" />
    </Group>,
    { width: TILE, height: TILE }
  );

  const sprites = useRectBuffer(SPRITES, (sprite, index) => {
    "worklet";
    const wobble = 4 * Math.sin(ticker.value + index * 0.1);
    sprite.setXYWH(0, 0, TILE + wobble, TILE + wobble);
  });

  const transforms = useRSXformBuffer(SPRITES, (xform, index) => {
    "worklet";
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const baseX = col * (TILE + 4) + 22;
    const baseY = row * (TILE + 4) + 22;
    const angle = ticker.value + col * 0.05;
    const wobble = Math.sin(ticker.value * 0.5 + row * 0.3) * 12;
    xform.set(Math.cos(angle), Math.sin(angle), baseX, baseY + wobble);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atlas buffers repro</Text>
      <Text style={styles.subtitle}>
        Open this screen on iOS (Reanimated 3 enabled). The animated atlas uses
        useRectBuffer/useRSXformBuffer so the recorder touches Skia host objects
        from the UI runtime and eventually crashes with the Hermes stack from
        the bug report.
      </Text>
      <Canvas style={styles.canvas}>
        {texture && (
          <Atlas
            image={texture}
            sprites={sprites}
            transforms={transforms}
          />
        )}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  canvas: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
});
