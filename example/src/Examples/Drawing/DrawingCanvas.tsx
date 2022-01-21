import React, { useEffect } from "react";
import type { ViewStyle } from "react-native";
import { SkiaView, Skia, useDrawCallback } from "@shopify/react-native-skia";

import { drawElements, drawSelectionRect } from "./Context/functions";
import { useDrawContext, useTouchDrawing } from "./Context";

type Props = {
  innerRef: React.RefObject<SkiaView>;
  style: ViewStyle;
};

const BackgroundPaint = Skia.Paint();
BackgroundPaint.setColor(Skia.Color("#FFF"));

export const DrawingCanvas: React.FC<Props> = ({ innerRef, style }) => {
  const drawContext = useDrawContext();
  useEffect(
    () => drawContext.addListener(() => innerRef.current?.redraw()),
    [drawContext, innerRef]
  );

  const touchHandler = useTouchDrawing(innerRef);
  const onDraw = useDrawCallback((canvas, info) => {
    // Update from pending touches
    touchHandler(info.touches);

    // Clear screen
    canvas.drawPaint(BackgroundPaint);

    // Draw elements
    drawElements(
      canvas,
      drawContext.state.elements,
      drawContext.state.selectedElements
    );

    // Draw selection rectangle
    if (drawContext.state.currentSelectionRect) {
      drawSelectionRect(canvas, drawContext.state.currentSelectionRect);
    }
  }, []);
  return <SkiaView ref={innerRef} style={style} onDraw={onDraw} />;
};
