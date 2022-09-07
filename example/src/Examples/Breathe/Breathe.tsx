import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  useComputedValue,
  useLoop,
  BlurMask,
  vec,
  Canvas,
  Circle,
  Group,
  Easing,
  mix,
} from "@shopify/react-native-skia";

const c2 = "#529ca0";

export const Breathe = () => {
  const { width, height } = useWindowDimensions();
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );

  const progress = useLoop({
    duration: 3000,
    easing: Easing.inOut(Easing.ease),
  });

  const transform = useComputedValue(
    () => [{ rotate: mix(progress.current, -Math.PI, 0) }],
    [progress]
  );

  return (
    <Canvas style={styles.container} debug>
      <Group origin={center} transform={transform} blendMode="screen">
        <BlurMask style="solid" blur={40} />
        <Circle c={center} r={200} color={c2} />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
