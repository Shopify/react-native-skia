import React, { useCallback } from "react";

import { NodeType } from "../Host";
import type { SkNode } from "../Host";
import type { DrawingContext } from "../DrawingContext";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize, processProps } from "../processors/Animations/Animations";
import { isPaint } from "../../skia";

type DrawingCallback = (ctx: DrawingContext, children: SkNode[]) => void;

type UseDrawingCallback<T> = (
  ctx: DrawingContext,
  props: T,
  children: SkNode[]
) => void;

export const useDrawing = <T,>(
  props: AnimatedProps<T>,
  cb: UseDrawingCallback<T>
) =>
  useCallback<DrawingCallback>(
    (ctx, children) => {
      const materializedProps = materialize(ctx, props);
      cb(ctx, materializedProps, children);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props]
  );

export type DrawingProps = AnimatedProps<CustomPaintProps> & {
  onDraw: DrawingCallback;
  skipProcessing?: boolean;
};

export const Drawing = (props: DrawingProps) => {
  return <skDrawing {...props} />;
};

export const DrawingNode = (props: DrawingProps): SkNode<NodeType.Drawing> => ({
  type: NodeType.Drawing,
  props,
  visitProps: (node, cb) => {
    processProps(node.props, cb);
    node.children.forEach((c) => c.visitProps(c, cb));
  },
  draw: (ctx, { onDraw, skipProcessing, ...newProps }, children) => {
    if (skipProcessing) {
      onDraw(ctx, children);
    } else {
      const drawingProps = materialize(ctx, newProps);
      const selectedPaint = selectPaint(ctx.paint, drawingProps);
      processPaint(selectedPaint, ctx.opacity, drawingProps);
      // to draw only once:
      // onDraw({ ...ctx, paint: selectedPaint }, children);
      [
        selectedPaint,
        ...children
          .map((child) => {
            if (child.type === NodeType.Declaration) {
              const ret = child.draw(ctx, child.props, child.children);
              if (ret) {
                return ret;
              }
            }
            return null;
          })
          .filter(isPaint),
      ].forEach((paint) => {
        onDraw({ ...ctx, paint }, children);
      });
    }
  },
  children: [],
});
