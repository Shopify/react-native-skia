import { BlendMode } from "../../../skia/types";
import type { Skia, SkColorFilter } from "../../../skia/types";
import { JsiNestedDeclarationNode } from "../Node";
import type {
  BlendColorFilterProps,
  MatrixColorFilterProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { processColor } from "../datatypes";
import { enumKey } from "../datatypes/Enum";
import type { LerpColorFilterProps } from "../../types/ColorFilters";

export class MatrixColorFilterNode extends JsiNestedDeclarationNode<
  MatrixColorFilterProps,
  SkColorFilter
> {
  constructor(Skia: Skia, props: MatrixColorFilterProps) {
    super(Skia, DeclarationType.ColorFilter, NodeType.MatrixColorFilter, props);
  }

  get() {
    // TODO: do composition
    const { matrix } = this.props;
    return this.Skia.ColorFilter.MakeMatrix(matrix);
  }
}

export class BlendColorFilterNode extends JsiNestedDeclarationNode<
  BlendColorFilterProps,
  SkColorFilter
> {
  constructor(Skia: Skia, props: BlendColorFilterProps) {
    super(Skia, DeclarationType.ColorFilter, NodeType.BlendColorFilter, props);
  }

  get() {
    // TODO: do composition
    const { mode } = this.props;
    const color = processColor(this.Skia, this.props.color, 1);
    return this.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
  }
}

// export class ComposeColorFilterNode extends JsiNestedDeclarationNode<
//   null,
//   SkColorFilter
// > {
//   constructor(Skia: Skia) {
//     super(Skia, DeclarationType.ColorFilter, NodeType.ComposeColorFilter, null);
//   }

//   get() {
//     // TODO: do composition
//     return this.getRecursively(
//       this.Skia.ColorFilter.MakeCompose.bind(this.Skia.ColorFilter)
//     );
//   }
// }

export class LinearToSRGBGammaColorFilterNode extends JsiNestedDeclarationNode<
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
    // TODO: do composition
    return this.Skia.ColorFilter.MakeLinearToSRGBGamma();
  }
}

export class SRGBToLinearGammaColorFilterNode extends JsiNestedDeclarationNode<
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
    // TODO: do composition
    return this.Skia.ColorFilter.MakeSRGBToLinearGamma();
  }
}

export class LumaColorFilterNode extends JsiNestedDeclarationNode<
  null,
  SkColorFilter
> {
  constructor(Skia: Skia) {
    super(Skia, DeclarationType.ColorFilter, NodeType.LumaColorFilter, null);
  }

  get() {
    // TODO: do composition
    return this.Skia.ColorFilter.MakeLumaColorFilter();
  }
}

export class LerpColorFilterNode extends JsiNestedDeclarationNode<
  LerpColorFilterProps,
  SkColorFilter
> {
  constructor(Skia: Skia, props: LerpColorFilterProps) {
    super(Skia, DeclarationType.ColorFilter, NodeType.LerpColorFilter, props);
  }

  get() {
    const { t } = this.props;
    return this.Skia.ColorFilter.MakeLerp(
      t,
      this.children[0].get(),
      this.children[1].get()
    );
  }
}
