import type { BlendProps } from "../../types/ImageFilters";
import { BlendMode } from "../../../skia/types";
import { DeclarationType, NodeType } from "../../types/NodeType";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";
import { enumKey } from "../datatypes";
import type { DeclarationContext } from "../../types/DeclarationContext";

export class BlendNode extends JsiDeclarationNode<BlendProps> {
  constructor(ctx: NodeContext, props: BlendProps) {
    super(ctx, DeclarationType.ImageFilter, NodeType.Blend, props);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const { Skia } = this;
    const blend = BlendMode[enumKey(this.props.mode)];
    // Blend ImageFilters
    const imageFilters = ctx.popImageFilters();
    if (imageFilters.length > 0) {
      const imageFilter = imageFilters.reverse().reduce((inner, outer) => {
        if (inner === null) {
          return outer;
        }
        return Skia.ImageFilter.MakeBlend(blend, outer, inner);
      });
      ctx.pushImageFilter(imageFilter);
    }
    const shaders = ctx.popShaders();
    if (shaders.length > 0) {
      // Blend Shaders
      const shader = shaders.reverse().reduce((inner, outer) => {
        if (inner === null) {
          return outer;
        }
        return Skia.Shader.MakeBlend(blend, outer, inner);
      });
      ctx.pushShader(shader);
    }
  }
}
