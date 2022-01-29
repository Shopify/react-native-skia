import type { IImage, IPath, IRect } from "@shopify/react-native-skia";

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

export type DrawingElementType = "path" | "shape" | "image";

export type DrawingElement = {
  type: DrawingElementType;
  color: number;
  size: number;
  path: IPath;
} & (
  | { type: "path" | "shape"; path: IPath }
  | { type: "image"; path: IPath; image: IImage }
);

export type DrawingElements = DrawingElement[];

export type ResizeMode = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export type DrawState = {
  color: number;
  size: number;
  elements: DrawingElements;
  selectedElements: DrawingElements;
  currentSelectionRect: IRect | undefined;
  resizeMode: ResizeMode | undefined;
};

export type DrawCommands = {
  setSize: (size: number) => void;
  setColor: (color: number) => void;
  addElement: (element: DrawingElement) => void;
  setSelectedElements: (...elements: DrawingElements) => void;
  setSelectionRect: (selection: IRect | undefined) => void;
  deleteSelectedElements: () => void;
  setResizeMode: (resizeMode: ResizeMode | undefined) => void;
};

export type DrawContextType = {
  state: DrawState;
  commands: DrawCommands;
  addListener: (listener: (state: DrawState) => void) => () => void;
};
