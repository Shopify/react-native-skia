import { useImage } from "../../../skia";
import { TileMode } from "../../../skia/ImageFilter/ImageFilter";
import { FilterMode, MipmapMode } from "../../../skia/Image/Image";
import { useDeclaration } from "../Declaration";

import type { UnresolvedImageProps } from "./Image";

interface ImageShaderProps {
  source: UnresolvedImageProps["source"];
}

export const ImageShader = ({ source }: ImageShaderProps) => {
  const image = useImage(source);
  const onDeclare = useDeclaration(() => {
    if (image === null) {
      return null;
    }
    const shader = image.makeShaderOptions(
      TileMode.Decal,
      TileMode.Decal,
      FilterMode.Nearest,
      MipmapMode.None
    );
    return shader;
  }, [image]);
  return <skDeclaration onDeclare={onDeclare} />;
};
