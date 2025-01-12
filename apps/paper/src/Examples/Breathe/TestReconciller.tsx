import React, { useCallback, useMemo, useState } from "react";
import { Button, StyleSheet, useWindowDimensions, View } from "react-native";
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

interface RingProps {
  index: number;
  progress: SharedValue<number>;
  total: number;
}

const Ring = ({ index, progress, total }: RingProps) => {
  const { width, height } = useWindowDimensions();
  const R = width / 4;
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );

  const theta = (index * (2 * Math.PI)) / total;
  const transform = useDerivedValue(() => {
    const { x, y } = polar2Canvas(
      { theta, radius: progress.value * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progress.value, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  });

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

export const Breathe = () => {
  const [rings, setRings] = useState(12);
  const { width, height } = useWindowDimensions();
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );

  const progress = useLoop({ duration: 3000 });

  const transform = useDerivedValue(() => [
    { rotate: mix(progress.value, -Math.PI, 0) },
  ]);

  const add = useCallback(() => {
    setRings((r) => r + 1);
  }, []);
  const remove = useCallback(() => {
    setRings((r) => Math.max(1, r - 1));
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <View>
        <Button onPress={add} title="add" />
        <Button onPress={remove} title="remove" />
      </View>
      <Canvas style={styles.container} opaque>
        <Fill color="rgb(36,43,56)" />
        <Group origin={center} transform={transform} blendMode="screen">
          <BlurMask style="solid" blur={40} />
          {new Array(rings).fill(0).map((_, index) => {
            return (
              <Ring
                key={index}
                index={index}
                progress={progress}
                total={rings}
              />
            );
          })}
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
