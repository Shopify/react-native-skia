import React from "react";
import {
  BlurMask,
  vec,
  Circle,
  Fill,
  Group,
  polar2Canvas,
  mix,
} from "@shopify/react-native-skia";
import { useCurrentFrame } from "remotion";

import { CANVAS } from "../components";

const c1 = "#61bea2";
const c2 = "#529ca0";

const { width, height } = CANVAS;

const center = vec(width / 2, height / 2);

const R = 200;

interface RingProps {
  index: number;
  progress: number;
}

const Ring = ({ index, progress }: RingProps) => {
  const theta = (index * (2 * Math.PI)) / 6;
  const transform = (() => {
    const { x, y } = polar2Canvas(
      { theta, radius: progress * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progress, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  })();

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
  const frame = useCurrentFrame();

  const progress = Math.round(frame % 120) / 120;

  const transform = (() => [{ rotate: mix(progress, -Math.PI, 0) }])();

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
