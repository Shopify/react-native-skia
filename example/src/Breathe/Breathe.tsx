import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import type { FrameCallback } from "@shopify/react-native-skia";
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
  useLoop,
  Easing,
  mix,
  transformOrigin,
} from "@shopify/react-native-skia";

const { width } = Dimensions.get("window");
const c1 = "#61bea2";
const c2 = "#529ca0";
const R = width / 4;

interface RingProps {
  index: number;
  progress: FrameCallback<number>;
}

const Ring = ({ index, progress }: RingProps) => {
  const theta = (index * (2 * Math.PI)) / 6;
  const animatedGroup = useFrame((ctx) => {
    const progressVal = progress(ctx);
    const { x, y } = polar2Canvas(
      { theta, radius: progressVal * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progressVal, 0.3, 1);
    return {
      transform: transformOrigin(ctx.center, [
        { translateX: x },
        { translateY: y },
        { scale },
      ]),
    };
  }, []);
  const animatedCircle = useFrame(({ center }) => {
    return {
      cx: center.x,
      cy: center.y,
    };
  }, []);
  return (
    <Group animatedProps={animatedGroup}>
      <Circle
        r={R}
        color={index % 2 ? c1 : c2}
        animatedProps={animatedCircle}
      />
    </Group>
  );
};

export const Breathe = () => {
  const progress = useLoop({
    duration: 3000,
    easing: Easing.bezier(0.5, 0, 0.5, 1),
  });
  const paint = usePaintRef();
  const animatedProps = useFrame(
    (ctx) => ({
      transform: transformOrigin(ctx.center, [
        { rotate: mix(progress(ctx), -Math.PI, 0) },
      ]),
    }),
    []
  );
  return (
    <Canvas style={styles.container} mode="continuous">
      <Paint ref={paint} blendMode="screen">
        <Blur style="solid" sigma={40} />
      </Paint>
      <Fill color="rgb(36,43,56)" />
      <Group animatedProps={animatedProps} paint={paint}>
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
