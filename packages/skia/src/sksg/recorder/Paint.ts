import type { PaintProps as CompPaintProps } from "../../dom/types";
import type { Node } from "../nodes";

export interface PaintProps extends Omit<CompPaintProps, "children"> {
  children: Node[];
}
