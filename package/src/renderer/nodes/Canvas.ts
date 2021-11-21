import type { CanvasKit } from "canvaskit-wasm";

import type { DrawingContext } from "../CanvasKitView";
import type { SkContainer, SkNode } from "../Host";
import { NodeType, processChildren } from "../Host";

export const CanvasNode = (
  CanvasKit: CanvasKit,
  redraw: () => void
): SkContainer => ({
  type: NodeType.Canvas,
  props: {},
  draw: (ctx: DrawingContext, _props, children: SkNode[]) => {
    processChildren(ctx, children);
  },
  children: [],
  redraw,
  CanvasKit,
});
