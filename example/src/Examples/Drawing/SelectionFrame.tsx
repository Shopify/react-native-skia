import React, { useMemo } from "react";
import { Group, Rect } from "@shopify/react-native-skia";

import type { DrawingElements } from "./Context/types";
import { getBoundingBox } from "./Context/functions/getBoundingBox";
import { SelectionResizeHandle } from "./SelectionHandle";

type Props = {
  selectedElements: DrawingElements;
};

const SelectionHandleSize = 6;

export const SelectionFrame: React.FC<Props> = ({ selectedElements }) => {
  const boundingBox = useMemo(
    () => getBoundingBox(selectedElements)!,
    [selectedElements]
  );
  return selectedElements.length > 0 ? (
    <Group>
      {/** Rect around selected elements */}
      <Rect rect={boundingBox} color="#4185F4" strokeWidth={2} style="stroke" />
      <Rect rect={boundingBox} color="#4185F418" style="fill" />
      {/** Resize handles */}
      <SelectionResizeHandle
        x={boundingBox.x}
        y={boundingBox.y}
        size={SelectionHandleSize}
      />
      <SelectionResizeHandle
        x={boundingBox.x + boundingBox.width}
        y={boundingBox.y}
        size={SelectionHandleSize}
      />
      <SelectionResizeHandle
        x={boundingBox.x + boundingBox.width}
        y={boundingBox.y + boundingBox.height}
        size={SelectionHandleSize}
      />
      <SelectionResizeHandle
        x={boundingBox.x}
        y={boundingBox.y + boundingBox.height}
        size={SelectionHandleSize}
      />
    </Group>
  ) : null;
};
