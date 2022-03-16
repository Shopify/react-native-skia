import { Group, Rect } from "@shopify/react-native-skia";
import type { FC } from "react";
import React, { useMemo } from "react";

type Props = {
  x: number;
  y: number;
  size: number;
};

export const SelectionResizeHandle: FC<Props> = ({ x, y, size }) => {
  const x1 = useMemo(() => x - size / 2, [x, size]);
  const y1 = useMemo(() => y - size / 2, [y, size]);
  return (
    <Group>
      {/** Rect */}
      <Rect
        x={x1}
        y={y1}
        width={size}
        height={size}
        color="#4185F4"
        strokeWidth={4}
        style="stroke"
      />
      <Rect
        x={x1}
        y={y1}
        width={size}
        height={size}
        color="#FFF"
        style="fill"
      />
      {/** Resize handles */}
    </Group>
  );
};
