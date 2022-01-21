import type { IRect, ICanvas } from "@shopify/react-native-skia";
import { PaintStyle, Skia } from "@shopify/react-native-skia";

const selectedPaintBg = Skia.Paint();
selectedPaintBg.setAntiAlias(true);
selectedPaintBg.setColor(Skia.Color("#4185F418"));
selectedPaintBg.setStyle(PaintStyle.Fill);

const selectedPaintBorder = Skia.Paint();
selectedPaintBorder.setAntiAlias(true);
selectedPaintBorder.setColor(Skia.Color("#4185F4"));
selectedPaintBorder.setStrokeWidth(2);
selectedPaintBorder.setStyle(PaintStyle.Stroke);

const cornerPaintBackground = Skia.Paint();
cornerPaintBackground.setAntiAlias(true);
cornerPaintBackground.setColor(Skia.Color("#FFF"));
cornerPaintBackground.setStyle(PaintStyle.Fill);

export const drawFocusRect = (canvas: ICanvas, rect: IRect) => {
  const selectedRect = Skia.XYWHRect(
    rect.x - 1,
    rect.y - 1,
    rect.width + 2,
    rect.height + 2
  );
  canvas.drawRect(selectedRect, selectedPaintBg);
  canvas.drawRect(selectedRect, selectedPaintBorder);

  // Draw resizing corners
  drawCorner(
    canvas,
    Skia.XYWHRect(selectedRect.x - 5, selectedRect.y - 5, 10, 10)
  );
  drawCorner(
    canvas,
    Skia.XYWHRect(
      selectedRect.x + selectedRect.width - 5,
      selectedRect.y - 5,
      10,
      10
    )
  );
  drawCorner(
    canvas,
    Skia.XYWHRect(
      selectedRect.x + selectedRect.width - 5,
      selectedRect.y + selectedRect.height - 5,
      10,
      10
    )
  );
  drawCorner(
    canvas,
    Skia.XYWHRect(
      selectedRect.x - 5,
      selectedRect.y + selectedRect.height - 5,
      10,
      10
    )
  );
};

const drawCorner = (canvas: ICanvas, rect: IRect) => {
  canvas.drawRect(rect, cornerPaintBackground);
  canvas.drawRect(rect, selectedPaintBorder);
};
