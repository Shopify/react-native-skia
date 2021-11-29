import type { IRect } from "../../../skia";
import { useImage, TileMode, FilterMode, MipmapMode } from "../../../skia";
import { useDeclaration } from "../../nodes";
import type { TransformProps, SkEnum, AnimatedProps } from "../../processors";
import { localMatrix, enumKey } from "../../processors";

import type { ImageProps } from "./Image";
import type { Fit } from "./BoxFit";
import { rect2rect, fitRects } from "./BoxFit";

// TODO: add fit property and infer the transform matrix from src and dst
interface ImageShaderProps extends TransformProps {
  source: ImageProps["source"];
  tx: SkEnum<typeof TileMode>;
  ty: SkEnum<typeof TileMode>;
  fm: SkEnum<typeof FilterMode>;
  mm: SkEnum<typeof MipmapMode>;
  fit: Fit;
  fitRect?: IRect;
}

export const ImageShader = (
  props: AnimatedProps<ImageShaderProps, "source">
) => {
  const image = useImage(props.source);
  const declaration = useDeclaration(
    props,
    ({ tx, ty, fm, mm, fit, fitRect, ...transform }) => {
      if (image === null) {
        return null;
      }
      if (fitRect) {
        const rects = fitRects(fit, image, fitRect);
        const m3 = rect2rect(rects.src, rects.dst);
        transform.transform = [...(transform.transform ?? []), ...m3];
      }
      return image.makeShaderOptions(
        TileMode[enumKey(tx)],
        TileMode[enumKey(ty)],
        FilterMode[enumKey(fm)],
        MipmapMode[enumKey(mm)],
        localMatrix(transform)
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
