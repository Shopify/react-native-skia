import type { DependencyManager } from "./DependencyManager";
import type { DrawingContext } from "./DrawingContext";
import { Node } from "./nodes";

export class Container extends Node {
  redraw: () => void;

  constructor(depMgr: DependencyManager, redraw: () => void) {
    super(depMgr, {});
    this.redraw = redraw;
  }

  draw(ctx: DrawingContext) {
    this.visit(ctx);
  }
}
