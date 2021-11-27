import { useImage } from "../../../skia";
import { TileMode } from "../../../skia/ImageFilter/ImageFilter";
import { FilterMode, MipmapMode } from "../../../skia/Image/Image";
import { useDeclaration } from "../Declaration";
import { processTransform2d, skiaMatrix3 } from "../../math";
import type { TransformProps } from "../processors";
import { transformOrigin } from "../processors";

import type { UnresolvedImageProps } from "./Image";

interface ImageShaderProps extends TransformProps {
  source: UnresolvedImageProps["source"];
}

export const ImageShader = ({
  source,
  transform,
  origin,
}: ImageShaderProps) => {
  const image = useImage(source);
  const onDeclare = useDeclaration(() => {
    if (image === null) {
      return null;
    }
    return image.makeShaderOptions(
      TileMode.Decal,
      TileMode.Decal,
      FilterMode.Nearest,
      MipmapMode.None,
      transform
        ? skiaMatrix3(
            processTransform2d(
              origin ? transformOrigin(origin, transform) : transform
            )
          )
        : undefined
    );
  }, [image, origin, transform]);
  return <skDeclaration onDeclare={onDeclare} />;
};
