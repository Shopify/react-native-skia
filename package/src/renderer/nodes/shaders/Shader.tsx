import type { ReactNode } from "react";

import { isShader } from "../../../skia";
import type { IRuntimeEffect } from "../../../skia";
import { useDeclaration } from "../Declaration";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";

export interface ShaderProps {
  source: IRuntimeEffect;
  uniforms: number[];
  children?: ReactNode | ReactNode[];
}

export const Shader = (props: AnimatedProps<ShaderProps>) => {
  const onDeclare = useDeclaration(
    (ctx, children) => {
      const { uniforms, source } = materialize(ctx, props);
      return source.makeShaderWithChildren(
        uniforms,
        true,
        children.filter(isShader)
      );
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Shader.defaultProps = {
  uniforms: [],
};
