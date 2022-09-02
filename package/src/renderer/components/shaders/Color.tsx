import React from "react";

import { createDeclaration } from "../../nodes";
import type { AnimatedProps } from "../../processors";
import type { Color } from "../../../skia/types";
import { processColor } from "../../../dom/nodes/datatypes";

export interface ColorShaderProps {
  color: Color;
}

const onDeclare = createDeclaration<ColorShaderProps>(
  ({ color }, _, { Skia }) => {
    return Skia.Shader.MakeColor(processColor(Skia, color, 1));
  }
);

export const ColorShader = (props: AnimatedProps<ColorShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
