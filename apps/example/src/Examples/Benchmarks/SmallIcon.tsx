import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Canvas, Circle, Group, Path, Skia } from "react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Hud } from "./Hud";
import { useBenchClock, useBenchRunner } from "./harness";
import type { Phase } from "./harness";

// A small animated canvas (a spinner) in an ordinary full-screen layout.
// Before #4184, every frame of a non-opaque canvas made Android repaint the
// whole window; the results server reads the window's frame statistics and
// the render thread's CPU time while the spinner turns.

const phases: Phase[] = [
  { name: "calibration", params: { animate: false } },
  { name: "spinner", params: { animate: true }, durationMs: 10000 },
];

const size = 56;

interface SpinnerProps {
  clock: SharedValue<number>;
  animate: boolean;
}

const Spinner = ({ clock, animate }: SpinnerProps) => {
  const arc = useMemo(() => {
    return Skia.PathBuilder.Make()
      .addArc(Skia.XYWHRect(6, 6, size - 12, size - 12), 0, 270)
      .build();
  }, []);
  const transform = useDerivedValue(() => [
    { rotate: animate ? clock.value / 400 : 0 },
  ]);
  const origin = useMemo(() => Skia.Point(size / 2, size / 2), []);
  return (
    <Canvas style={{ width: size, height: size }}>
      <Group transform={transform} origin={origin}>
        <Path
          path={arc}
          style="stroke"
          strokeWidth={5}
          strokeCap="round"
          color="#007aff"
        />
        <Circle cx={size / 2} cy={6} r={4} color="#ff6b6b" />
      </Group>
    </Canvas>
  );
};

export const SmallIcon = () => {
  const [animate, setAnimate] = useState(false);
  const clock = useBenchClock();
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: string;
    params?: { auto?: boolean };
  }>();
  const { status, results } = useBenchRunner(
    "small-icon",
    phases,
    (phase) => setAnimate(phase.params?.animate as boolean),
    () => {
      if (route.params?.auto && navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Syncing</Text>
          <Text style={styles.subtitle}>
            A small canvas in a regular screen
          </Text>
        </View>
        <Spinner clock={clock} animate={animate} />
      </View>
      <ScrollView>
        {new Array(40).fill(0).map((_, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.rowTitle}>Item {i + 1}</Text>
              <Text style={styles.rowSubtitle}>Nothing here animates</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <Hud title="Small icon" status={status} results={results} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    marginTop: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  subtitle: {
    color: "#666",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#cfd8dc",
  },
  rowTitle: {
    color: "#111",
    fontWeight: "600",
  },
  rowSubtitle: {
    color: "#777",
    fontSize: 12,
  },
});
