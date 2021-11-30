import type { ReactNode } from "react";

import { BlendMode, Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors/Paint";
import { isShader } from "../../../skia/Shader/Shader";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface BlendShaderProps {
  mode: SkEnum<typeof BlendMode>;
  children: ReactNode | ReactNode[];
}

export const BlendShader = (props: AnimatedProps<BlendShaderProps>) => {
  const declaration = useDeclaration(props, ({ mode }, children) => {
    const [one, two] = children.filter(isShader);
    return Skia.Shader.MakeBlend(BlendMode[enumKey(mode)], one, two);
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
