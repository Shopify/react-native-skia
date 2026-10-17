import React, { useMemo, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Canvas, Circle, Path, Skia } from "react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Hud } from "./Hud";
import { useBenchClock, useBenchRunner } from "./harness";
import type { Phase } from "./harness";
import { palette } from "./palette";

// A grid of small canvases, each a sparkline with a cursor that follows the
// clock: the kind of screen a list of charts makes. Every canvas is its own
// view with its own frames. In v2 the UI thread drew them one after the
// other; in v3 the render thread pool replays them in parallel.

const counts = [20, 50, 100, 200];
const columns = 10;

const phases: Phase[] = [
  { name: "calibration", params: { canvases: 0 } },
  ...counts.map((canvases) => ({
    name: `canvases-${canvases}`,
    params: { canvases },
  })),
];

interface SparkProps {
  index: number;
  width: number;
  height: number;
  clock: SharedValue<number>;
}

const Spark = ({ index, width, height, clock }: SparkProps) => {
  const path = useMemo(() => {
    const p = Skia.PathBuilder.Make();
    const points = 30;
    let seed = index * 7919 + 17;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let i = 0; i < points; i++) {
      const x = (i / (points - 1)) * width;
      const y = height * (0.2 + 0.6 * random());
      if (i === 0) {
        p.moveTo(x, y);
      } else {
        p.lineTo(x, y);
      }
    }
    return p.build();
  }, [index, width, height]);
  const cx = useDerivedValue(
    () => ((clock.value / 20 + index * 13) % width) as number
  );
  return (
    <Canvas style={{ width, height }}>
      <Path
        path={path}
        style="stroke"
        strokeWidth={1.5}
        color={palette[index % palette.length]}
      />
      <Circle cx={cx} cy={height / 2} r={3} color="white" />
    </Canvas>
  );
};

export const ManyCanvases = () => {
  const [canvases, setCanvases] = useState(0);
  const clock = useBenchClock();
  const { width } = useWindowDimensions();
  const size = Math.floor(width / columns);
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: string;
    params?: { auto?: boolean };
  }>();
  const { status, results } = useBenchRunner(
    "many-canvases",
    phases,
    (phase) => setCanvases(phase.params?.canvases as number),
    () => {
      if (route.params?.auto && navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  );
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {new Array(canvases).fill(0).map((_, i) => (
          <Spark
            key={i}
            index={i}
            width={size - 2}
            height={size - 2}
            clock={clock}
          />
        ))}
      </View>
      <Hud title="Many canvases" status={status} results={results} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  grid: {
    flex: 1,
    paddingTop: 72,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    alignContent: "flex-start",
  },
});
