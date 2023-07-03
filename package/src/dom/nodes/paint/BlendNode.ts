import type { BlendProps } from "../../types/ImageFilters";
import { BlendMode } from "../../../skia/types";
import { DeclarationType, NodeType } from "../../types/NodeType";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";
import { enumKey } from "../datatypes";
import type { DeclarationContext } from "../../types/DeclarationContext";
import { composeDeclarations } from "../../types/DeclarationContext";

export class BlendNode extends JsiDeclarationNode<BlendProps> {
  constructor(ctx: NodeContext, props: BlendProps) {
    super(ctx, DeclarationType.ImageFilter, NodeType.Blend, props);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const { Skia } = this;
    const blend = BlendMode[enumKey(this.props.mode)];
    // Blend ImageFilters
    const imageFilters = ctx.imageFilters.popAll();
    if (imageFilters.length > 0) {
      const composer = Skia.ImageFilter.MakeBlend.bind(Skia.ImageFilter, blend);
      ctx.imageFilters.push(composeDeclarations(imageFilters, composer));
    }
    // Blend Shaders
    const shaders = ctx.shaders.popAll();
    if (shaders.length > 0) {
      const composer = Skia.Shader.MakeBlend.bind(Skia.Shader, blend);
      ctx.shaders.push(composeDeclarations(shaders, composer));
    }
  }
}
