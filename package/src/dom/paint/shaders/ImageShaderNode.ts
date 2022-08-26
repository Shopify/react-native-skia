import type { SkImage, SkShader } from "../../../skia/types";
import { FilterMode, MipmapMode, TileMode } from "../../../skia/types";
import { DeclarationNode, NodeType } from "../../Node";

export interface ImageShaderNodeProps {
  image: SkImage;
}

export class ImageShaderNode extends DeclarationNode<
  ImageShaderNodeProps,
  SkShader
> {
  constructor(props: ImageShaderNodeProps) {
    super(NodeType.ImageShader, props);
  }

  get() {
    return this.props.image.makeShaderOptions(
      TileMode.Decal,
      TileMode.Decal,
      FilterMode.Nearest,
      MipmapMode.Nearest
    );
  }
}
