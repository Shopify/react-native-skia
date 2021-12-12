import React, { useCallback } from "react";
import { Dimensions, StyleSheet } from "react-native";
import type { AnimationValue } from "@shopify/react-native-skia";
import {
  BlurMask,
  vec,
  Canvas,
  Circle,
  Fill,
  Group,
  Paint,
  polar2Canvas,
  Easing,
  mix,
  useLoop,
} from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");
const c1 = "#61bea2";
const c2 = "#529ca0";
const R = width / 4;
const center = vec(width / 2, height / 2 - 64);

interface RingProps {
  index: number;
  progress: AnimationValue<number>;
}

const Ring = ({ index, progress }: RingProps) => {
  const theta = (index * (2 * Math.PI)) / 6;
  const transform = useCallback(() => {
    const { x, y } = polar2Canvas(
      { theta, radius: progress.value * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progress.value, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  }, [progress.value, theta]);

  return (
    <Group origin={center} transform={transform}>
      <Circle c={center} r={R} color={index % 2 ? c1 : c2} />
    </Group>
  );
};

export const Breathe = () => {
  const progress = useLoop(
    {
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
    },
    { yoyo: true }
  );

  return (
    <Canvas style={styles.container} debug>
      <Paint blendMode="screen">
        <BlurMask style="solid" sigma={40} />
      </Paint>
      <Fill color="rgb(36,43,56)" />
      <Group
        origin={center}
        transform={() => [{ rotate: mix(progress.value, -Math.PI, 0) }]}
      >
        {new Array(6).fill(0).map((_, index) => {
          return <Ring key={index} index={index} progress={progress} />;
        })}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
