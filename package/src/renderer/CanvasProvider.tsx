import type { DrawingContext } from "./DrawingContext";

const _drawingContexts: Array<DrawingContext> = [];

export const pushDrawingContext = (ctx: DrawingContext) => {
  _drawingContexts.push(ctx);
};

export const popDrawingContext = () => {
  _drawingContexts.pop();
};

export const peekDrawingContext = (): DrawingContext | undefined => {
  if (_drawingContexts.length > 0) {
    return _drawingContexts[_drawingContexts.length - 1];
  }
  return undefined;
};
