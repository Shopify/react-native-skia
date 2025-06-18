import React from "react";

import type { SkiaDefaultProps } from "../../processors";
import type { ShaderProps } from "../../../dom/types";

export const Shader = ({
  uniforms = {},
  ...props
}: SkiaDefaultProps<ShaderProps, "uniforms">) => {
  return <skShader uniforms={uniforms} {...props} />;
};
