import React from "react";
import type { ReactNode } from "react";

import { BlendMode, Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors/Paint";
import { isShader } from "../../../skia/Shader/Shader";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface BlendShaderProps {
  mode: SkEnum<typeof BlendMode>;
  children: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<BlendShaderProps>(({ mode }, children) => {
  const [one, two] = children.filter(isShader);
  return Skia.Shader.MakeBlend(BlendMode[enumKey(mode)], one, two);
});

export const BlendShader = (props: AnimatedProps<BlendShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
