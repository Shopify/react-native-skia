import type { SkRuntimeEffect } from "../../../../skia/types";
import { DeclarationNode, NodeType } from "../../Node";
import type { SkShader } from "../../../../skia/types/Shader/Shader";

export interface ShaderNodeProps {
  runtimeEffect: SkRuntimeEffect;
  uniforms: number[];
}

export class ShaderNode extends DeclarationNode<ShaderNodeProps, SkShader> {
  children: DeclarationNode<unknown, SkShader>[] = [];

  constructor(props: ShaderNodeProps) {
    super(NodeType.Shader, props);
  }

  addChild(shader: DeclarationNode<unknown, SkShader>) {
    this.children.push(shader);
  }

  get() {
    const { runtimeEffect, uniforms } = this.props;
    if (this.children.length === 0) {
      return runtimeEffect.makeShader(uniforms);
    }
    return runtimeEffect.makeShaderWithChildren(
      uniforms,
      this.children.map((child) => child.get())
    );
  }
}
