import type { Skia, SkRuntimeEffect } from "../../../../skia/types";
import { NestedDeclarationNode, NodeType } from "../../Node";
import type { SkShader } from "../../../../skia/types/Shader/Shader";

export interface ShaderNodeProps {
  runtimeEffect: SkRuntimeEffect;
  uniforms: number[];
}

export class ShaderNode extends NestedDeclarationNode<
  ShaderNodeProps,
  SkShader
> {
  constructor(props: ShaderNodeProps) {
    super(NodeType.Shader, props);
  }

  get(Skia: Skia) {
    const { runtimeEffect, uniforms } = this.props;
    if (this.children.length === 0) {
      return runtimeEffect.makeShader(uniforms);
    }
    return runtimeEffect.makeShaderWithChildren(
      uniforms,
      this.children.map((child) => child.get(Skia))
    );
  }
}
