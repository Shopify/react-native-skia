import React from "react";

import { processColor } from "../../../skia";
import { createDeclaration } from "../../nodes";
import type { AnimatedProps } from "../../processors";
import type { Color } from "../../../skia/types";

export interface ColorShaderProps {
  color: Color;
}

const onDeclare = createDeclaration<ColorShaderProps>(
  ({ color }, _children, { Skia }) => {
    return Skia.Shader.MakeColor(processColor(color, 1));
  }
);

export const ColorShader = (props: AnimatedProps<ColorShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
