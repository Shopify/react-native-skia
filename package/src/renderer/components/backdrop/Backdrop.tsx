import React from "react";
import type { ReactNode } from "react";

import { Skia, processColor, isImageFilter, ClipOp } from "../../../skia";
import type { AnimatedProps, RectDef, RRectDef } from "../../processors";
import type { Color, ICanvas } from "../../../skia";
import { useDrawing } from "../../nodes";
import { processChildren } from "../../Host";
import { isRRectDef, processRect, processRRect } from "../../processors";
import type { PathDef } from "../../processors/Paths";
import { isPathDef } from "../../processors/Paths";

type ClipDef = RectDef | RRectDef | { path: PathDef };

const processPath = (rawPath: PathDef) => {
  const path =
    typeof rawPath === "string"
      ? Skia.Path.MakeFromSVGString(rawPath)
      : rawPath;
  if (!path) {
    throw new Error("Invalid path: " + rawPath);
  }
  return path;
};

const clip = (canvas: ICanvas, def: ClipDef, op: ClipOp) => {
  if (isPathDef(def)) {
    const path = processPath(def.path);
    canvas.clipPath(path, op, true);
  } else if (isRRectDef(def)) {
    const rrect = processRRect(def);
    console.log({ rrect });
    canvas.clipRRect(rrect, op, true);
  } else {
    const rect = processRect(def);
    canvas.clipRect(rect, op, true);
  }
};

export type BaseBackdropProps = {
  color?: Color;
} & ClipDef;

export type BackdropProps = BaseBackdropProps & {
  children: ReactNode | ReactNode[];
};

export const Backdrop = (props: AnimatedProps<BackdropProps>) => {
  const onDraw = useDrawing(props, (ctx, { color, ...clipDef }, children) => {
    const filter = processChildren(ctx, children);
    const [imgf] = filter.filter(isImageFilter);
    if (!imgf) {
      throw new Error("No image filter provided to the background");
    }
    const { canvas, opacity } = ctx;
    canvas.save();
    clip(canvas, clipDef, ClipOp.Intersect);
    canvas.saveLayer(undefined, null, imgf);
    if (color) {
      canvas.drawColor(processColor(color, opacity));
    }
    canvas.restore();
    canvas.restore();
  });
  return <skDrawing onDraw={onDraw} {...props} skipProcessing />;
};
