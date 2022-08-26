import type {
  SkImage,
  SkShader,
  SkMatrix,
  FilterMode,
  MipmapMode,
  TileMode,
} from "../../../../skia/types";
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
    const { image, tx, ty, fm, mm, localMatrix } = this.props;
    return image.makeShaderOptions(tx, ty, fm, mm, localMatrix);
  }
}
