import type { SkiaReadonlyValue, Vector } from "@shopify/react-native-skia";
import {
  Circle,
  Shadow,
  Group,
  DashPathEffect,
  Line,
  vec,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";

import { SIZE } from "../Model";

interface CursorProps {
  c: SkiaReadonlyValue<Vector>;
}

export const Cursor = ({ c }: CursorProps) => {
  const p1 = useDerivedValue(() => vec(c.current.x, 0), [c]);
  const p2 = useDerivedValue(() => vec(c.current.x, SIZE), [c]);
  return (
    <>
      <Line
        p1={p1}
        p2={p2}
        color="lightgray"
        style="stroke"
        strokeWidth={2}
        strokeCap="round"
      >
        <DashPathEffect intervals={[6, 6]} />
      </Line>
      <Group>
        <Circle c={c} r={12} color="white">
          <Shadow dx={0} dy={0} color="rgba(0, 0, 0, 0.3)" blur={4} />
        </Circle>
        <Circle c={c} r={7} color="#3DFFF3" />
      </Group>
    </>
  );
};
