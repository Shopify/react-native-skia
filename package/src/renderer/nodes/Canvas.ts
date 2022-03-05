import type { DrawingContext } from "../DrawingContext";
import { SkContainer } from "../Host";

export class CanvasNode extends SkContainer {
  constructor(redraw: () => void) {
    super(redraw);
  }

  draw(ctx: DrawingContext) {
    this.visit(ctx);
  }
}
