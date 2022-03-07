import React from "react";

import { Skia, processColor } from "../../../skia";
import { createDeclaration } from "../../nodes";
import type { AnimatedProps } from "../../processors";
import type { Color } from "../../../skia";

export interface ColorShaderProps {
  color: Color;
}

const onDeclare = createDeclaration<ColorShaderProps>(({ color }) => {
  return Skia.Shader.MakeColor(processColor(color, 1));
});

export const ColorShader = (props: AnimatedProps<ColorShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
