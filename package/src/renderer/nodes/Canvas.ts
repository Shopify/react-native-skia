import type { DrawingContext } from "../DrawingContext";
import type { SkContainer, SkNode } from "../Host";
import { NodeType, processChildren } from "../Host";

export const CanvasNode = (redraw: () => void): SkContainer => ({
  type: NodeType.Canvas,
  props: {},
  draw: (ctx: DrawingContext, _props, children: SkNode[]) => {
    processChildren(ctx, children);
  },
  visitProps: (node, cb) => {
    node.children.forEach((c) => c.visitProps(c, cb));
  },
  children: [],
  redraw,
});
