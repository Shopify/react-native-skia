import type { ICanvas, IRect } from "@shopify/react-native-skia";
import { PaintStyle, Skia } from "@shopify/react-native-skia";

const selectedPaintBorder = Skia.Paint();
selectedPaintBorder.setColor(Skia.Color("#000"));
selectedPaintBorder.setStyle(PaintStyle.Stroke);
selectedPaintBorder.setStrokeWidth(2);
selectedPaintBorder.setPathEffect(Skia.PathEffect.MakeDash([4, 4], 0));

export const drawSelectionRect = (canvas: ICanvas, selection: IRect) => {
  const selectedRect = {
    x: selection.x,
    y: selection.y,
    width: selection.width,
    height: selection.height,
  };
  canvas.drawRect(selectedRect, selectedPaintBorder);
};
