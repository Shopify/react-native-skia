import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Canvas, Circle, Fill, Group, Rect, Skia } from "react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Hud } from "./Hud";
import { useBenchClock, useBenchRunner } from "./harness";
import type { Phase } from "./harness";
import { palette } from "./palette";

// One animating canvas on each Android backing view, then a scroll view of
// cards with a canvas in each (non-opaque canvases, so TextureViews). The
// presented frame rate is read from SurfaceFlinger by the results server;
// the screen itself reports the UI and JS thread cadence. On iOS the
// backing view makes no difference and the phases run the same.

type Mode = "none" | "TextureView" | "SurfaceView" | "cards";

const phases: Phase[] = [
  { name: "calibration", params: { mode: "none" } },
  { name: "TextureView", params: { mode: "TextureView" } },
  { name: "SurfaceView", params: { mode: "SurfaceView" } },
  { name: "cards", params: { mode: "cards" } },
];

interface SceneProps {
  width: number;
  height: number;
  clock: SharedValue<number>;
  rects: number;
}

const Scene = ({ width, height, clock, rects }: SceneProps) => {
  const list = useMemo(() => {
    const columns = Math.max(1, Math.ceil(Math.sqrt(rects)));
    const cell = (Math.min(width, height) * 0.8) / columns;
    const x0 = width / 2 - (columns * cell) / 2;
    const y0 = height / 2 - (columns * cell) / 2;
    return new Array(rects)
      .fill(0)
      .map((_, i) =>
        Skia.XYWHRect(
          x0 + (i % columns) * cell,
          y0 + Math.floor(i / columns) * cell,
          cell * 0.7,
          cell * 0.5
        )
      );
  }, [rects, width, height]);
  const transform = useDerivedValue(() => [{ rotate: clock.value / 2500 }]);
  const origin = useMemo(
    () => Skia.Point(width / 2, height / 2),
    [width, height]
  );
  const cx = useDerivedValue(
    () => width / 2 + (width / 2 - 40) * Math.sin(clock.value / 600)
  );
  return (
    <>
      <Fill color="#0b1020" />
      <Group transform={transform} origin={origin}>
        {list.map((r, i) => (
          <Rect key={i} rect={r} color={palette[i % palette.length]} />
        ))}
      </Group>
      <Circle cx={cx} cy={height / 2} r={24} color="white" />
    </>
  );
};

export const AndroidBacking = () => {
  const [mode, setMode] = useState<Mode>("none");
  const clock = useBenchClock();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: string;
    params?: { auto?: boolean };
  }>();
  const { status, results } = useBenchRunner(
    "android-backing",
    phases,
    (phase) => setMode(phase.params?.mode as Mode),
    () => {
      if (route.params?.auto && navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  );
  const canvasHeight = 320;
  return (
    <View style={styles.container}>
      {(mode === "TextureView" || mode === "SurfaceView") && (
        <Canvas
          key={mode}
          style={{ width, height: canvasHeight, marginTop: 80 }}
          android={
            mode === "SurfaceView"
              ? { backingView: "SurfaceView", opaque: true }
              : { backingView: "TextureView", opaque: false }
          }
        >
          <Scene
            width={width}
            height={canvasHeight}
            clock={clock}
            rects={300}
          />
        </Canvas>
      )}
      {mode === "cards" && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.cards}>
          {new Array(6).fill(0).map((_, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>Card {i + 1}</Text>
              <Canvas style={{ width: width - 48, height: 96 }}>
                <Scene
                  width={width - 48}
                  height={96}
                  clock={clock}
                  rects={40}
                />
              </Canvas>
            </View>
          ))}
        </ScrollView>
      )}
      <Hud title="Android backing views" status={status} results={results} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scroll: {
    flex: 1,
    marginTop: 80,
  },
  cards: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f2f2f7",
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
});
