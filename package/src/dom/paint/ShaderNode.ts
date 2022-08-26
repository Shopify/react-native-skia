import { Node, NodeType } from "../Node";
import type { SkRuntimeEffect } from "../../skia/types/RuntimeEffect/RuntimeEffect";
import type { Uniforms } from "../../skia/types";

export interface ShaderNodeProps {
  runtimeEffect: SkRuntimeEffect;
  uniforms: Uniforms;
  children?: ShaderNode[];
}

export abstract class ShaderNode extends Node<ShaderNodeProps> {
  constructor(props: ShaderNodeProps) {
    super(NodeType.Shader, props);
  }
}
