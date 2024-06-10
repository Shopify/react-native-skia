import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import {
  BlurMask,
  vec,
  Canvas,
  Circle,
  Fill,
  Group,
  polar2Canvas,
  mix,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

import { useLoop } from "../../components/Animations";

const c1 = "#61bea2";
const c2 = "#529ca0";
const width = 100;
const height = 100;

interface RingProps {
  index: number;
  progress: SharedValue<number>;
}

const Ring = ({ index, progress }: RingProps) => {
  const R = width / 4;
  const center = useMemo(() => vec(width / 2, height / 2 - 64), []);

  const theta = (index * (2 * Math.PI)) / 6;
  const transform = useDerivedValue(() => {
    const { x, y } = polar2Canvas(
      { theta, radius: progress.value * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progress.value, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  }, [progress, R]);

  return (
    <Circle
      c={center}
      r={R}
      color={index % 2 ? c1 : c2}
      origin={center}
      transform={transform}
    />
  );
};

export const BreatheScreen = () => {
  const center = useMemo(() => vec(width / 2, height / 2 - 64), []);

  const progress = useLoop({ duration: 3000 });

  const transform = useDerivedValue(
    () => [{ rotate: mix(progress.value, -Math.PI, 0) }],
    [progress]
  );

  return (
    <>
      <Fill color="rgb(36,43,56)" />
      <Group origin={center} transform={transform} blendMode="screen">
        <BlurMask style="solid" blur={40} />
        {new Array(6).fill(0).map((_, index) => {
          return <Ring key={index} index={index} progress={progress} />;
        })}
      </Group>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
