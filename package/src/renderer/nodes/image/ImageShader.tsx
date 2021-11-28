import { useImage } from "../../../skia";
import { TileMode } from "../../../skia/ImageFilter/ImageFilter";
import { FilterMode, MipmapMode } from "../../../skia/Image/Image";
import { useDeclaration } from "../Declaration";
import type { TransformProps } from "../processors";
import { localMatrix } from "../processors/Transform";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";

import type { ImageProps } from "./Image";

// TODO: add fit property and infer the transform matrix from src and dst
interface ImageShaderProps extends TransformProps {
  source: ImageProps["source"];
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
      const { transform, origin } = materialize(ctx, props);
      return image.makeShaderOptions(
        TileMode.Decal,
        TileMode.Decal,
        FilterMode.Nearest,
        MipmapMode.None,
        localMatrix({ transform, origin })
      );
    },
    [image, props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};
