import type { SkImage, SkShader, SkMatrix } from "../../../../skia/types";
import { FilterMode, MipmapMode, TileMode } from "../../../../skia/types";
import { DeclarationNode, NodeType } from "../../Node";

export interface ImageShaderNodeProps {
  image: SkImage;
  tx: TileMode;
  ty: TileMode;
  fm: FilterMode;
  mm: MipmapMode;
  localMatrix?: SkMatrix;
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
