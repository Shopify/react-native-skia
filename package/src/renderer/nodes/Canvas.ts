import type { DrawingContext } from "../DrawingContext";
import { SkContainer } from "../Host";
import { bounds } from "../processors/Rects";

export class CanvasNode extends SkContainer {
  constructor(redraw: () => void) {
    super(redraw);
  }

  draw(ctx: DrawingContext) {
    this.visit(ctx);
  }

  bounds(ctx: DrawingContext) {
    return bounds(this.children.map((child) => child.bounds(ctx)));
  }
}
