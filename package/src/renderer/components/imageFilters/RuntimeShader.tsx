import React from "react";

import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { SkRuntimeEffect, Uniforms } from "../../../skia/types";
import { processUniforms } from "../../../skia/types/Shader/Shader";

import { getInput } from "./getInput";

export interface RuntimeShaderProps {
  source: SkRuntimeEffect;
  uniforms?: Uniforms;
}

const onDeclare = createDeclaration<RuntimeShaderProps>(
  ({ source, uniforms }, children, { Skia }) => {
    const rtb = Skia.RuntimeShaderBuilder(source);
    if (uniforms) {
      processUniforms(source, uniforms, rtb);
    }
    return Skia.ImageFilter.MakeRuntimeShader(
      rtb,
      null,
      getInput(Skia, children)
    );
  }
);

export const RuntimeShader = (props: AnimatedProps<RuntimeShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
