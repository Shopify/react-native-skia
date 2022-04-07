import React from "react";
import { StyleSheet } from "react-native";
import type { SkiaReadonlyValue, Vector } from "@shopify/react-native-skia";
import {
  useCanvas,
  useDerivedValue,
  useLoop,
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
} from "@shopify/react-native-skia";

const c1 = "#61bea2";
const c2 = "#529ca0";

interface RingProps {
  index: number;
  progress: SkiaReadonlyValue<number>;
  center: Vector;
  r: number;
}

const Ring = ({ index, progress, center, r }: RingProps) => {
  const theta = (index * (2 * Math.PI)) / 6;
  const transform = useDerivedValue(() => {
    const { x, y } = polar2Canvas(
      { theta, radius: progress.current * r },
      { x: 0, y: 0 }
    );
    const scale = mix(progress.current, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  }, [progress]);

  return (
    <Group origin={center} transform={transform}>
      <Circle c={center} r={r} color={index % 2 ? c1 : c2} />
    </Group>
  );
};

const Rings = () => {
  const progress = useLoop({
    duration: 3000,
    easing: Easing.inOut(Easing.ease),
  });

  const transform = useDerivedValue(
    () => [{ rotate: mix(progress.current, -Math.PI, 0) }],
    [progress]
  );
  const { width, height } = useCanvas();
  const R = width / 4;
  const center = vec(width / 2, height / 2);
  return (
    <>
      <Paint blendMode="screen">
        <BlurMask style="solid" blur={40} />
      </Paint>
      <Fill color="rgb(36,43,56)" />
      <Group origin={center} transform={transform}>
        {new Array(6).fill(0).map((_, index) => {
          return (
            <Ring
              center={center}
              r={R}
              key={index}
              index={index}
              progress={progress}
            />
          );
        })}
      </Group>
    </>
  );
};

export const Breathe = () => {
  return (
    <Canvas style={styles.container} debug>
      <Rings />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
