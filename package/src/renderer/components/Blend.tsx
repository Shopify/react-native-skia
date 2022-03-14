import type { ReactNode } from "react";
import React from "react";

import { isImageFilter, Skia, BlendMode } from "../../skia";
import { useDeclaration } from "../nodes";
import type { AnimatedProps, SkEnum } from "../processors";
import { isShader } from "../../skia/Shader/Shader";
import { enumKey } from "../processors/Paint";

interface BlendProps {
  mode: SkEnum<typeof BlendMode>;
  children?: ReactNode | ReactNode[];
}
export const Blend = (props: AnimatedProps<BlendProps>) => {
  const declaration = useDeclaration(props, ({ mode }, children) => {
    const [inner, outer] = children;
    const blend = BlendMode[enumKey(mode)];
    if (isImageFilter(outer) && isImageFilter(inner)) {
      return Skia.ImageFilter.MakeBlend(blend, outer, inner);
    } else if (isShader(outer) && isShader(inner)) {
      return Skia.Shader.MakeBlend(blend, outer, inner);
    }
    throw new Error("<Blend /> can only blend Shaders or ImageFilters");
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
