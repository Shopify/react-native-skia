import type { ReactNode } from "react";

import { isShader } from "../../../skia";
import type { IRuntimeEffect } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface ShaderProps {
  source: IRuntimeEffect;
  uniforms: number[];
  isOpaque?: boolean;
  children?: ReactNode | ReactNode[];
}

export const Shader = (props: AnimatedProps<ShaderProps>) => {
  const declaration = useDeclaration<ShaderProps>(
    props,
    ({ uniforms, source, isOpaque }, children) => {
      return source.makeShaderWithChildren(
        uniforms,
        isOpaque,
        children.filter(isShader)
      );
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};

Shader.defaultProps = {
  uniforms: [],
};
