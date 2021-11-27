import type { ReactNode } from "react";

import { BlendMode, Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";
import type { SkEnum } from "../processors/Paint";
import { isShader } from "../../../skia/Shader/Shader";
import { enumKey } from "../processors/Paint";

export interface BlendProps {
  mode: SkEnum<typeof BlendMode>;
  children: ReactNode | ReactNode[];
}

export const Blend = ({ mode, ...props }: BlendProps) => {
  const onDeclare = useDeclaration(
    (_, children) => {
      const [one, two] = children.filter(isShader);
      console.log(BlendMode[enumKey(mode)], one, two);
      return Skia.Shader.MakeBlend(BlendMode[enumKey(mode)], one, two);
    },
    [mode]
  );
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
