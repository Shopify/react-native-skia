import React from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { IRuntimeEffect } from "../../../skia/RuntimeEffect/RuntimeEffect";

import { getInput } from "./getInput";

export interface RuntimeShaderProps {
  source: IRuntimeEffect;
}

const onDeclare = createDeclaration<RuntimeShaderProps>(
  ({ source }, children) => {
    const rtb = Skia.RuntimeShaderBuilder(source);
    return Skia.ImageFilter.MakeRuntimeShader(rtb, null, getInput(children));
  }
);

export const RuntimeShader = (props: AnimatedProps<RuntimeShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
