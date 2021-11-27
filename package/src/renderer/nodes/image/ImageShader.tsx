import { useImage } from "../../../skia";
import { TileMode } from "../../../skia/ImageFilter/ImageFilter";
import { FilterMode, MipmapMode } from "../../../skia/Image/Image";
import { useDeclaration } from "../Declaration";
import type { TransformProps } from "../processors";
import { localMatrix } from "../processors/Transform";

import type { UnresolvedImageProps } from "./Image";

// TODO: move to shaders folder
// TODO: add fit property and infer the transform matrix from src and dst
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
      localMatrix({ transform, origin })
    );
  }, [image, origin, transform]);
  return <skDeclaration onDeclare={onDeclare} />;
};
