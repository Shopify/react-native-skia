import { Group, Rect } from "@shopify/react-native-skia";
import React from "react";
type Props = {
  x: () => number;
  y: () => number;
  size: number;
};

export const SelectionResizeHandle: React.FC<Props> = ({ x, y, size }) => {
  return (
    <Group>
      {/** Rect */}
      <Rect
        x={() => x() - size / 2}
        y={() => y() - size / 2}
        width={size}
        height={size}
        color="#4185F4"
        strokeWidth={4}
        style="stroke"
      />
      <Rect
        x={() => x() - size / 2}
        y={() => y() - size / 2}
        width={size}
        height={size}
        color="#FFF"
        style="fill"
      />
      {/** Resize handles */}
    </Group>
  );
};
