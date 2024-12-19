import type { DrawingContext } from "./DrawingContext";
import type { Node } from "./Node";
import { draw } from "./Nodes";

export class Container {
  root: Node[] = [];
  public unmounted = false;

  constructor() {}

  clear() {
    console.log("clear container");
  }
  redraw() {
    console.log("redraw container");
  }

  render(ctx: DrawingContext) {
    this.root.forEach((node) => {
      draw(ctx, node);
    });
  }
}
