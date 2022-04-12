import type { ReactNode } from "react";
import React, { useRef, useMemo, useState } from "react";

import type { SkRect, SkPaint } from "../../../skia";
import { Skia, TileMode, FilterMode } from "../../../skia";
import { createDrawing } from "../../nodes";
import type { SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import { Rect } from "../shapes/Rect";
import { Group } from "../Group";

interface ImageDrawingProps {
  tx: SkEnum<typeof TileMode>;
  ty: SkEnum<typeof TileMode>;
  fm: SkEnum<typeof FilterMode>;
  rect: SkRect;
  children?: ReactNode | ReactNode[];
}

export const ImageDrawing = ({ rect, ...props }: ImageDrawingProps) => {
  const paint = useRef<SkPaint>();
  const onDraw = useMemo(
    () =>
      createDrawing<ImageDrawingProps>((ctx, { tx, ty, fm }, node) => {
        if (paint.current === undefined) {
          console.log("Record: " + new Date().getSeconds());
          const recorder = Skia.PictureRecorder();
          const canvas = recorder.beginRecording(rect);
          node.visit({
            ...ctx,
            canvas,
          });
          const pic = recorder.finishRecordingAsPicture();
          console.log({ pic });
          const shaderPaint = Skia.Paint();
          shaderPaint.setShader(
            pic.makeShader(
              TileMode[enumKey(tx)],
              TileMode[enumKey(ty)],
              FilterMode[enumKey(fm)]
            )
          );
          paint.current = shaderPaint;
        }
      }),
    [paint, rect]
  );
  if (paint.current) {
    return <Rect rect={rect} paint={paint} />;
  }
  return (
    <>
      <skDrawing onDraw={onDraw} skipProcessing {...props} />
    </>
  );
};

ImageDrawing.defaultProps = {
  tx: "decal",
  ty: "decal",
  fm: "nearest",
} as const;
