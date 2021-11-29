import type { ReactNode } from "react";

import { BlendMode, Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors/Paint";
import { isShader } from "../../../skia/Shader/Shader";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";

export interface BlendProps {
  mode: SkEnum<typeof BlendMode>;
  children: ReactNode | ReactNode[];
}

export const Blend = (props: AnimatedProps<BlendProps>) => {
  const onDeclare = useDeclaration(
    (ctx, children) => {
      const { mode } = materialize(ctx, props);
      const [one, two] = children.filter(isShader);
      return Skia.Shader.MakeBlend(BlendMode[enumKey(mode)], one, two);
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
