import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import type { FrameValue } from "@shopify/react-native-skia";
import {
  vec,
  Blur,
  Canvas,
  Circle,
  Fill,
  Group,
  Paint,
  polar2Canvas,
  useFrame,
  mix,
  useLoop,
  Easing,
} from "@shopify/react-native-skia";
const { width, height } = Dimensions.get("window");
const c1 = "#61bea2";
const c2 = "#529ca0";
const R = width / 4;
const center = vec(width / 2, height / 2 - 64);

interface RingProps {
  index: number;
  progress: FrameValue<number>;
}

const Ring = ({ index, progress }: RingProps) => {
  const theta = (index * (2 * Math.PI)) / 6;
  const transform = useFrame((ctx) => {
    const progressVal = progress(ctx);
    const { x, y } = polar2Canvas(
      { theta, radius: progressVal * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progressVal, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  }, []);
  return (
    <Group origin={center} transform={transform}>
      <Circle c={center} r={R} color={index % 2 ? c1 : c2} />
    </Group>
  );
};

export const Breathe = () => {
  const progress = useLoop({
    duration: 3000,
    easing: Easing.inOut(Easing.ease),
  });
  const transform = useFrame(
    (ctx) => [{ rotate: mix(progress(ctx), -Math.PI, 0) }],
    []
  );
  return (
    <Canvas style={styles.container} mode="continuous">
      <Paint blendMode="screen">
        <Blur style="solid" sigma={40} />
      </Paint>
      <Fill color="rgb(36,43,56)" />
      <Group origin={center} transform={transform}>
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
