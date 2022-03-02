import React from "react";

import type { IRect, IImage } from "../../../skia";
import { TileMode, FilterMode, MipmapMode } from "../../../skia";
import { useDeclaration } from "../../nodes";
import type { TransformProps, SkEnum, AnimatedProps } from "../../processors";
import { localMatrix, enumKey } from "../../processors";
import type { RectCtor } from "../../processors/Rects";
import { rect } from "../../processors/Rects";

import type { Fit } from "./BoxFit";
import { rect2rect, fitRects } from "./BoxFit";

const getRect = (
  props: Omit<ImageShaderProps, "tx" | "ty" | "fm" | "mm" | "fit" | "image">
): IRect | undefined => {
  const { x, y, width, height } = props;
  if (props.rect) {
    return props.rect;
  } else if (
    x !== undefined &&
    y !== undefined &&
    width !== undefined &&
    height !== undefined
  ) {
    return rect(x, y, width, height);
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
  rect?: IRect;
  image: IImage;
}

export const ImageShader = (props: AnimatedProps<ImageShaderProps>) => {
  const declaration = useDeclaration(
    props,
    ({ tx, ty, fm, mm, fit, image, ...imageShaderProps }) => {
      const rct = getRect(imageShaderProps);
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
        localMatrix(imageShaderProps)
      );
    }
  );
  return <skDeclaration declaration={declaration} />;
};

ImageShader.defaultProps = {
  tx: "decal",
  ty: "decal",
  fm: "nearest",
  mm: "none",
  fit: "none",
  transform: [],
} as const;
