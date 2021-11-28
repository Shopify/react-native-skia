import type { ReactNode } from "react";

import { isShader } from "../../../skia";
import type { IRuntimeEffect } from "../../../skia";
import { useDeclaration } from "../Declaration";

export interface ShaderProps {
  source: IRuntimeEffect;
  uniforms: number[];
  children?: ReactNode | ReactNode[];
}

export const Shader = ({ uniforms, source, ...props }: ShaderProps) => {
  const onDeclare = useDeclaration(
    (_, children) => {
      return source.makeShaderWithChildren(
        uniforms,
        true,
        children.filter(isShader)
      );
    },
    [source, uniforms]
  );
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Shader.defaultProps = {
  uniforms: [],
};
