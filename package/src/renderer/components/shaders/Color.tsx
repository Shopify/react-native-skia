import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { ColorProp } from "../../processors/Paint";
import { processColor } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface ColorShaderProps {
  color: ColorProp;
}

export const ColorShader = (props: AnimatedProps<ColorShaderProps>) => {
  const declaration = useDeclaration(props, ({ color }) => {
    return Skia.Shader.MakeColor(processColor(color, 1));
  });
  return <skDeclaration declaration={declaration} />;
};
