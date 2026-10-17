import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Canvas, Fill, Group, Rect, Skia } from "react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Hud } from "./Hud";
import { useBenchClock, useBenchRunner } from "./harness";
import type { Phase } from "./harness";
import { palette } from "./palette";

// A canvas whose frame costs more and more to draw (thousands of rects
// rotating as one group) next to a plain React Native animation. In v2 the
// UI thread drew the frame, so the animation beside it stuttered with the
// canvas; in v3 the UI thread only writes the rotation and the render
// thread pool draws.

const counts = [1000, 3000, 6000, 12000];

const phases: Phase[] = [
  { name: "calibration", params: { rects: 0 } },
  ...counts.map((rects) => ({ name: `rects-${rects}`, params: { rects } })),
];

interface SceneProps {
  rects: number;
  clock: SharedValue<number>;
}

const Scene = ({ rects, clock }: SceneProps) => {
  const { width, height } = useWindowDimensions();
  const area = Math.min(width, height * 0.6);
  const cx = width / 2;
  const cy = height * 0.35;
  const list = useMemo(() => {
    const columns = Math.max(1, Math.ceil(Math.sqrt(rects)));
    const cell = area / columns;
    const size = cell * 0.7;
    const x0 = cx - area / 2;
    const y0 = cy - area / 2;
    return new Array(rects)
      .fill(0)
      .map((_, i) =>
        Skia.XYWHRect(
          x0 + (i % columns) * cell,
          y0 + Math.floor(i / columns) * cell,
          size,
          size * 0.6
        )
      );
  }, [rects, area, cx, cy]);
  const transform = useDerivedValue(() => [{ rotate: clock.value / 3000 }]);
  const origin = useMemo(() => Skia.Point(cx, cy), [cx, cy]);
  return (
    <Canvas style={styles.canvas}>
      <Fill color="#0b1020" />
      <Group transform={transform} origin={origin}>
        {list.map((r, i) => (
          <React.Fragment key={i}>
            <Rect rect={r} color={palette[i % palette.length]} />
            <Rect rect={r} color="white" style="stroke" strokeWidth={1} />
          </React.Fragment>
        ))}
      </Group>
    </Canvas>
  );
};

// The React Native side: a box Reanimated moves on the UI thread.
const Bouncer = () => {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [progress]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (width - 96) }],
  }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.box, style]} />
    </View>
  );
};

export const HeavyCanvas = () => {
  const [rects, setRects] = useState(0);
  const clock = useBenchClock();
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: string;
    params?: { auto?: boolean };
  }>();
  const { status, results } = useBenchRunner(
    "heavy-canvas",
    phases,
    (phase) => setRects(phase.params?.rects as number),
    () => {
      if (route.params?.auto && navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  );
  return (
    <View style={styles.container}>
      <Scene rects={rects} clock={clock} />
      <View style={styles.rn}>
        <Text style={styles.label}>React Native animation, {rects} rects</Text>
        <Bouncer />
      </View>
      <Hud title="Heavy canvas" status={status} results={results} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  canvas: {
    flex: 1,
  },
  rn: {
    height: 120,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  label: {
    color: "#333",
    marginBottom: 8,
  },
  track: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
  },
  box: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#ff6b6b",
    marginHorizontal: 24,
  },
});
