import type { IRect } from "@shopify/react-native-skia";
import { TileMode, Skia, ClipOp, Drawing } from "@shopify/react-native-skia";
import React from "react";

interface BackdropBlurProps {
  rect: IRect;
  color: string;
  intensity: number;
}

export const BackdropBlur = ({ rect, color, intensity }: BackdropBlurProps) => {
  return (
    <Drawing
      onDraw={({ canvas, paint }) => {
        canvas.save();
        // clip the area to filter
        canvas.clipRect(rect, ClipOp.Intersect, true);
        const blurFilter = Skia.ImageFilter.MakeBlur(
          intensity,
          intensity,
          TileMode.Decal,
          null
        );
        canvas.saveLayer(undefined, rect, blurFilter);
        // fills the clip
        canvas.drawColor(Skia.Color(color));
        canvas.restore();
        canvas.restore();
      }}
    />
  );
};
