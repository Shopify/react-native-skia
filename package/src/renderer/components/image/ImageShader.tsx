import { useImage } from "../../../skia";
import { TileMode } from "../../../skia/ImageFilter/ImageFilter";
import { FilterMode, MipmapMode } from "../../../skia/Image/Image";
import { useDeclaration } from "../../nodes/Declaration";
import type { TransformProps, SkEnum } from "../../processors";
import { localMatrix } from "../../processors/Transform";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";
import { enumKey } from "../../processors";

import type { ImageProps } from "./Image";

// TODO: add fit property and infer the transform matrix from src and dst
interface ImageShaderProps extends TransformProps {
  source: ImageProps["source"];
  tx: SkEnum<typeof TileMode>;
  ty: SkEnum<typeof TileMode>;
  fm: SkEnum<typeof FilterMode>;
  mm: SkEnum<typeof MipmapMode>;
}

export const ImageShader = (
  props: AnimatedProps<ImageShaderProps, "source">
) => {
  const image = useImage(props.source);
  const onDeclare = useDeclaration(
    (ctx) => {
      if (image === null) {
        return null;
      }
      const { tx, ty, fm, mm, ...transform } = materialize(ctx, props);
      return image.makeShaderOptions(
        TileMode[enumKey(tx)],
        TileMode[enumKey(ty)],
        FilterMode[enumKey(fm)],
        MipmapMode[enumKey(mm)],
        localMatrix(transform)
      );
    },
    [image, props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};

ImageShader.defaultProps = {
  tx: "decal",
  ty: "decal",
  fm: "nearest",
  mm: "none",
} as const;
