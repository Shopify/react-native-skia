import type { IImage, IPaint, IPath, IRect } from "@shopify/react-native-skia";

export type Tool = "draw" | "selection";
export type Menu = "drawing" | "size" | "color";
export type DrawingTool = "path" | "circle" | "rectangle" | "image";

export type UxState = {
  menu: Menu | undefined;
  drawingTool: DrawingTool;
  activeTool: Tool;
};

export type UxCommands = {
  toggleMenu: (menu: Menu | undefined) => void;
  setTool: (tool: Tool) => void;
  setDrawingTool: (mode: DrawingTool) => void;
};

export type UxContextType = {
  state: UxState;
  commands: UxCommands;
  addListener: (listener: (state: UxState) => void) => () => void;
};

export type DrawingElement = {
  type: DrawingTool;
  p: IPaint;
} & (
  | { type: "path"; primitive: IPath }
  | { type: "rectangle"; primitive: IPath }
  | { type: "circle"; primitive: IPath }
  | { type: "image"; primitive: IPath; image: IImage }
);

export type DrawingElements = DrawingElement[];

export type ResizeMode = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export type DrawState = {
  color: string;
  size: number;
  paint: IPaint;
  elements: DrawingElements;
  selectedElements: DrawingElements;
  currentSelectionRect: IRect | undefined;
  resizeMode: ResizeMode | undefined;
};

export type DrawCommands = {
  setSize: (size: number) => void;
  setColor: (color: string) => void;
  addElement: (element: DrawingElement) => void;
  setSelectedElements: (...elements: DrawingElements) => void;
  setSelection: (selection: IRect | undefined) => void;
  deleteSelection: () => void;
  setResizeMode: (resizeMode: ResizeMode | undefined) => void;
};

export type DrawContextType = {
  state: DrawState;
  commands: DrawCommands;
  addListener: (listener: (state: DrawState) => void) => () => void;
};
