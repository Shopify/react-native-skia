import type { DrawingContext } from "./DrawingContext";
import type { Node } from "./Node";

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

  render(_ctx: DrawingContext) {}
}
