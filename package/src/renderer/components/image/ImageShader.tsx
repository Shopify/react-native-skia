import React, { useMemo } from "react";

import type { IRect } from "../../../skia";
import { useImage, TileMode, FilterMode, MipmapMode } from "../../../skia";
import { useDeclaration } from "../../nodes";
import type { TransformProps, SkEnum, AnimatedProps } from "../../processors";
import { localMatrix, enumKey } from "../../processors";
import type { RectCtor } from "../../processors/Shapes";
import { rect } from "../../processors/Shapes";

import type { ImageProps } from "./Image";
import type { Fit } from "./BoxFit";
import { rect2rect, fitRects } from "./BoxFit";

const getRect = (props: Partial<ImageShaderProps>): IRect | undefined => {
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
  source: ImageProps["source"];
  tx: SkEnum<typeof TileMode>;
  ty: SkEnum<typeof TileMode>;
  fm: SkEnum<typeof FilterMode>;
  mm: SkEnum<typeof MipmapMode>;
  fit: Fit;
  rect?: IRect;
}

export const ImageShader = (
  defaultProps: AnimatedProps<ImageShaderProps, "source">
) => {
  const image = useImage(defaultProps.source);
  const props = useMemo(
    () => ({ ...defaultProps, image }),
    [defaultProps, image]
  );
  const declaration = useDeclaration(
    props,
    ({ tx, ty, fm, mm, fit, ...imageShaderProps }) => {
      if (image === null) {
        return null;
      }
      const rct = getRect(imageShaderProps);
      if (rct) {
        const rects = fitRects(fit, image, rct);
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
