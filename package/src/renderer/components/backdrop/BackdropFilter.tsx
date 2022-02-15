import React, { Children } from "react";

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

export type BackdropFilterProps = GroupProps;

export const BackdropFilter = (
  allProps: AnimatedProps<BackdropFilterProps>
) => {
  const { children: allChildren, ...props } = allProps;
  const [filterChild, ...groupChildren] = Children.toArray(allChildren);
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
