import type { ReactNode } from "react";
import React from "react";

import type { AnimatedProps } from "../../processors";
import { useDrawing } from "../../nodes";
import type { SkNode } from "../../Host";
import { processChildren } from "../../Host";
import { getInput } from "../imageFilters/getInput";
import type { GroupProps } from "../Group";
import { Group } from "../Group";

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
  const onDraw = useDrawing(props, (ctx, _, children) => {
    disableFilterMemoization(children);
    const toFilter = processChildren(ctx, children);
    const filter = getInput(toFilter);
    if (!filter) {
      throw new Error("No image filter provided to the background");
    }
    const { canvas } = ctx;
    canvas.saveLayer(undefined, null, filter);
    canvas.restore();
  });
  return (
    <Group {...props}>
      <skDrawing onDraw={onDraw} skipProcessing>
        {filterChild}
      </skDrawing>
      {groupChildren}
    </Group>
  );
};
