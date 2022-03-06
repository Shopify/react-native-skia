import type { ReactNode } from "react";
import React from "react";

import type { AnimatedProps } from "../../processors";
import { useDrawing } from "../../nodes";
import type { SkNode } from "../../Host";
import { getInput } from "../imageFilters/getInput";
import type { GroupProps } from "../Group";
import { Group } from "../Group";
import { useBounds } from "../../nodes/Drawing";

const disableFilterMemoization = (children: SkNode[]) => {
  children.forEach((child) => {
    child.memoizable = false;
    disableFilterMemoization(child.children);
  });
};

export interface BackdropFilterProps extends GroupProps {
  filter: ReactNode | ReactNode[];
}

export const BackdropFilter = ({
  filter: filterChild,
  children: groupChildren,
  ...props
}: AnimatedProps<BackdropFilterProps>) => {
  const onDraw = useDrawing(props, (ctx, _, node) => {
    disableFilterMemoization(node.children);
    const toFilter = node.visit(ctx);
    const filter = getInput(toFilter);
    if (!filter) {
      throw new Error("No image filter provided to the background");
    }
    const { canvas } = ctx;
    canvas.saveLayer(undefined, null, filter);
    canvas.restore();
  });
  // TODO: is this correct?
  const onBounds = useBounds(props, () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }));
  return (
    <Group {...props}>
      <skDrawing onBounds={onBounds} onDraw={onDraw} skipProcessing>
        {filterChild}
      </skDrawing>
      {groupChildren}
    </Group>
  );
};
