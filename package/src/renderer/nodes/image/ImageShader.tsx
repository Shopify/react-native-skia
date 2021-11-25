import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import { useImage } from "../../../skia";
import { TileMode } from "../../../skia/ImageFilter/ImageFilter";
import { FilterMode, MipmapMode } from "../../../skia/Image/Image";

import type { ImageProps, UnresolvedImageProps } from "./Image";

type UnresolvedImageShaderProps = Omit<UnresolvedImageProps, "x" | "y">;

export const ImageShader = ({
  source,
  width,
  height,
}: UnresolvedImageShaderProps) => {
  const image = useImage(source);
  if (image === null) {
    return null;
  }
  return <skImageShader source={image} width={width} height={height} />;
};

ImageShader.defaultProps = {
  resizeMode: "contain",
};

export type ImageShaderProps = Omit<ImageProps, "x" | "y" | "fit">;

export const ImageShaderNode = (
  props: ImageShaderProps
): SkNode<NodeType.ImageShader> => ({
  type: NodeType.ImageShader,
  props,
  draw: ({ paint }, { source }) => {
    const shader = source.makeShaderOptions(
      TileMode.Decal,
      TileMode.Decal,
      FilterMode.Linear,
      MipmapMode.None
    );
    paint.setShader(shader);
    return shader;
  },
  children: [],
  memoizable: true,
});
