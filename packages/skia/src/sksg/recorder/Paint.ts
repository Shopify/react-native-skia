import type { PaintProps as CompPaintProps } from "../../dom/types";

export type PaintProps = Omit<CompPaintProps, "children">;