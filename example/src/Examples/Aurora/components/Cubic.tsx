import React from "react";
import type { SkiaValue, CubicBezierHandle } from "@shopify/react-native-skia";
import {
  Line,
  Paint,
  Circle,
  useComputedValue,
} from "@shopify/react-native-skia";

import { symmetric } from "./Math";

interface CubicProps {
  mesh: SkiaValue<CubicBezierHandle[]>;
  index: number;
  color: string;
}

export const Cubic = ({ mesh, index, color }: CubicProps) => {
  const c1 = useComputedValue(() => mesh.current[index].c1, [mesh]);
  const c1S = useComputedValue(
    () => symmetric(mesh.current[index].c1, mesh.current[index].pos),
    [mesh]
  );
  const c2 = useComputedValue(() => mesh.current[index].c2, [mesh]);
  const c2S = useComputedValue(
    () => symmetric(mesh.current[index].c2, mesh.current[index].pos),
    [mesh]
  );
  const pos = useComputedValue(() => mesh.current[index].pos, [mesh]);
  return (
    <>
      <Line strokeWidth={2} color="white" p1={c1} p2={c1S} />
      <Line strokeWidth={2} color="white" p1={c2} p2={c2S} />
      <Circle c={pos} r={16} color={color}>
        <Paint style="stroke" strokeWidth={4} color="white" />
      </Circle>
      <Circle c={c1} r={10} color="white" />
      <Circle c={c2} r={10} color="white" />
      <Circle c={c1S} r={10} color="white" />
      <Circle c={c2S} r={10} color="white" />
    </>
  );
};
