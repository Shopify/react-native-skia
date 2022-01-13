import type { IPaint, IPath, IRect } from "@shopify/react-native-skia";

export type ElementType = "path" | "rect" | "circle";

export type DrawingElement = {
  type: ElementType;
  p: IPaint;
  translate?: { x: number; y: number };
} & (
  | { type: "path"; primitive: IPath }
  | { type: "rect"; primitive: IRect }
  | { type: "circle"; primitive: IRect }
);

export type DrawingElements = DrawingElement[];
