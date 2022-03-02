import React from "react";

import { Skia, processColor } from "../../../skia";
import { useDeclaration } from "../../nodes";
import type { AnimatedProps } from "../../processors";
import type { Color } from "../../../skia";

export interface ColorShaderProps {
  color: Color;
}

export const ColorShader = (props: AnimatedProps<ColorShaderProps>) => {
  const declaration = useDeclaration(props, ({ color }) => {
    return Skia.Shader.MakeColor(processColor(color, 1));
  });
  return <skDeclaration declaration={declaration} />;
};
