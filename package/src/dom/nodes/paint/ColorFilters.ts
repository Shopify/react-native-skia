import type {
  Skia,
  BlendMode,
  SkColor,
  SkColorFilter,
} from "../../../skia/types";
import { JsiDeclarationNode, JsiNestedDeclarationNode } from "../Node";
import { DeclarationType, NodeType } from "../../types";

export interface MatrixColorFilterNodeProps {
  colorMatrix: number[];
}

export class MatrixColorFilterNode extends JsiDeclarationNode<
  MatrixColorFilterNodeProps,
  SkColorFilter
> {
  constructor(Skia: Skia, props: MatrixColorFilterNodeProps) {
    super(Skia, DeclarationType.ColorFilter, NodeType.MatrixColorFilter, props);
  }

  get() {
    const { colorMatrix } = this.props;
    return this.Skia.ColorFilter.MakeMatrix(colorMatrix);
  }
}

export interface BlendColorFilterNodeProps {
  color: SkColor;
  mode: BlendMode;
}

export class BlendColorFilterNode extends JsiDeclarationNode<
  BlendColorFilterNodeProps,
  SkColorFilter
> {
  constructor(Skia: Skia, props: BlendColorFilterNodeProps) {
    super(Skia, DeclarationType.ColorFilter, NodeType.BlendColorFilter, props);
  }

  get() {
    const { color, mode } = this.props;
    return this.Skia.ColorFilter.MakeBlend(color, mode);
  }
}

export class ComposeColorFilterNode extends JsiNestedDeclarationNode<
  null,
  SkColorFilter
> {
  constructor(Skia: Skia) {
    super(Skia, DeclarationType.ColorFilter, NodeType.ComposeColorFilter, null);
  }

  get() {
    return this.getRecursively(
      this.Skia.ColorFilter.MakeCompose.bind(this.Skia.ColorFilter)
    );
  }
}

export class LinearToSRGBGammaColorFilterNode extends JsiDeclarationNode<
  null,
  SkColorFilter
> {
  constructor(Skia: Skia) {
    super(
      Skia,
      DeclarationType.ColorFilter,
      NodeType.LinearToSRGBGammaColorFilter,
      null
    );
  }

  get() {
    return this.Skia.ColorFilter.MakeLinearToSRGBGamma();
  }
}

export class SRGBToLinearGammaColorFilterNode extends JsiDeclarationNode<
  null,
  SkColorFilter
> {
  constructor(Skia: Skia) {
    super(
      Skia,
      DeclarationType.ColorFilter,
      NodeType.SRGBToLinearGammaColorFilter,
      null
    );
  }

  get() {
    return this.Skia.ColorFilter.MakeSRGBToLinearGamma();
  }
}

export class LumaColorFilterNode extends JsiDeclarationNode<
  null,
  SkColorFilter
> {
  constructor(Skia: Skia) {
    super(
      Skia,
      DeclarationType.ColorFilter,
      NodeType.LumaColorFilterColorFilter,
      null
    );
  }

  get() {
    return this.Skia.ColorFilter.MakeLumaColorFilter();
  }
}
