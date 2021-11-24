import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import type { FrameValue } from "@shopify/react-native-skia";
import {
  Blur,
  Canvas,
  Circle,
  Fill,
  Group,
  Paint,
  usePaintRef,
  polar2Canvas,
  useFrame,
  mix,
  transformOrigin,
} from "@shopify/react-native-skia";

import { useLoop } from "../../../package/src/renderer/nodes/processors/Animations/Timing";
import { Easing } from "../../../package/src/renderer/nodes/processors/Animations/Easing";

const { width } = Dimensions.get("window");
const c1 = "#61bea2";
const c2 = "#529ca0";
const R = width / 4;

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
    return transformOrigin(ctx.center, [
      { translateX: x },
      { translateY: y },
      { scale },
    ]);
  }, []);
  const c = useFrame(({ center }) => center);
  return (
    <Group transform={transform}>
      <Circle c={c} r={R} color={index % 2 ? c1 : c2} />
    </Group>
  );
};

export const Breathe = () => {
  const progress = useLoop({
    duration: 3000,
    easing: Easing.inOut(Easing.ease),
  });
  const paint = usePaintRef();
  const transform = useFrame(
    (ctx) =>
      transformOrigin(ctx.center, [
        { rotate: mix(progress(ctx), -Math.PI, 0) },
      ]),
    []
  );
  return (
    <Canvas style={styles.container} mode="continuous">
      <Paint ref={paint} blendMode="screen">
        <Blur style="solid" sigma={40} />
      </Paint>
      <Fill color="rgb(36,43,56)" />
      <Group transform={transform} paint={paint}>
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
