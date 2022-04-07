import type { ReactNode } from "react";
import React from "react";

import type { AnimatedProps } from "../../processors";
import { createDrawing } from "../../nodes";
import type { Node } from "../../nodes";
import { getInput } from "../imageFilters/getInput";
import type { GroupProps } from "../Group";
import { Group } from "../Group";

const disableFilterMemoization = (children: Node<unknown>[]) => {
  children.forEach((child) => {
    child.memoizable = false;
    disableFilterMemoization(child.children);
  });
};

export interface BackdropFilterProps extends GroupProps {
  filter: ReactNode | ReactNode[];
}

const onDraw = createDrawing<BackdropFilterProps>((ctx, _, node) => {
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

export const BackdropFilter = ({
  filter: filterChild,
  children: groupChildren,
  ...props
}: AnimatedProps<BackdropFilterProps>) => {
  return (
    <Group {...props}>
      <skDrawing onDraw={onDraw} skipProcessing>
        {filterChild}
      </skDrawing>
      {groupChildren}
    </Group>
  );
};
