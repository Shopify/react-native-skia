import React from "react";

import type { SkiaValue } from "../../../values/types";
import { processResult } from "../../../__tests__/setup";
import {
  BlurMask,
  Circle,
  Fill,
  Group,
  mix,
  polar2Canvas,
} from "../../components";
import { drawOnNode, height, importSkia, width } from "../setup";

const c1 = "#61bea2";
const c2 = "#529ca0";

interface RingProps {
  index: number;
  progress: SkiaValue<number>;
}

const Ring = ({ index, progress }: RingProps) => {
  const { useComputedValue, vec } = importSkia();

  const R = width / 4;
  const center = vec(width / 2, height / 2 - 64);

  const theta = (index * (2 * Math.PI)) / 6;
  const transform = useComputedValue(() => {
    const { x, y } = polar2Canvas(
      { theta, radius: progress.current * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progress.current, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  }, [progress]);

  return (
    <Group origin={center} transform={transform}>
      <Circle c={center} r={R} color={index % 2 ? c1 : c2} />
    </Group>
  );
};

export const Breathe = () => {
  const { useComputedValue, vec, useValue } = importSkia();

  const center = vec(width / 2, height / 2 - 64);

  const progress = useValue(0.5);

  const transform = useComputedValue(
    () => [{ rotate: mix(progress.current, -Math.PI, 0) }],
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

describe("Breathe", () => {
  it("should render the breathe example properly", () => {
    const surface = drawOnNode(<Breathe />);
    processResult(surface, "snapshots/demos/apple-breathe.png");
  });
});
