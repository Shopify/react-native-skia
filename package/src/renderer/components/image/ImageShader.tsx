import React from "react";

import { enumKey } from "../../../dom/nodes/datatypes";
import type { SkEnum } from "../../../dom/types";
import type { SkRect, SkImage, Skia } from "../../../skia/types";
import { TileMode, FilterMode, MipmapMode } from "../../../skia/types";
import { createDeclaration } from "../../nodes";
import type { TransformProps, AnimatedProps, RectCtor } from "../../processors";
import { localMatrix } from "../../processors";

import type { Fit } from "./BoxFit";
import { rect2rect, fitRects } from "./BoxFit";

const getRect = (
  Skia: Skia,
  props: Omit<ImageShaderProps, "tx" | "ty" | "fm" | "mm" | "fit" | "image">
): SkRect | undefined => {
  const { x, y, width, height } = props;
  if (props.rect) {
    return props.rect;
  } else if (
    x !== undefined &&
    y !== undefined &&
    width !== undefined &&
    height !== undefined
  ) {
    return Skia.XYWHRect(x, y, width, height);
  } else {
    return undefined;
  }
};

interface ImageShaderProps extends TransformProps, Partial<RectCtor> {
  tx: SkEnum<typeof TileMode>;
  ty: SkEnum<typeof TileMode>;
  fm: SkEnum<typeof FilterMode>;
  mm: SkEnum<typeof MipmapMode>;
  fit: Fit;
  rect?: SkRect;
  image: SkImage;
}

const onDeclare = createDeclaration<ImageShaderProps>(
  ({ tx, ty, fm, mm, fit, image, ...imageShaderProps }, _, { Skia }) => {
    const rct = getRect(Skia, imageShaderProps);
    if (rct) {
      const rects = fitRects(
        fit,
        { x: 0, y: 0, width: image.width(), height: image.height() },
        rct
      );
      const m3 = rect2rect(rects.src, rects.dst);
      imageShaderProps.transform = [
        ...(imageShaderProps.transform ?? []),
        ...m3,
      ];
    }
    return image.makeShaderOptions(
      TileMode[enumKey(tx)],
      TileMode[enumKey(ty)],
      FilterMode[enumKey(fm)],
      MipmapMode[enumKey(mm)],
      localMatrix(Skia.Matrix(), imageShaderProps)
    );
  }
);

export const ImageShader = (props: AnimatedProps<ImageShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

ImageShader.defaultProps = {
  tx: "decal",
  ty: "decal",
  fm: "nearest",
  mm: "none",
  fit: "none",
  transform: [],
} as const;
