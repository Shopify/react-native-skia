import type { ReactNode } from "react";
import React from "react";

import type { SkImageFilter, SkShader } from "../../skia/types";
import { isImageFilter, BlendMode, isShader } from "../../skia/types";
import { createDeclaration } from "../nodes";
import type { AnimatedProps, SkEnum } from "../processors";
import { enumKey } from "../processors/Paint";
import type { DeclarationResult } from "../nodes/Declaration";

const childrenAreImageFilters = (
  children: DeclarationResult[]
): children is SkImageFilter[] =>
  children.every((child) => isImageFilter(child));

const childrenAreShaders = (
  children: DeclarationResult[]
): children is SkShader[] => children.every((child) => isShader(child));

interface BlendProps {
  mode: SkEnum<typeof BlendMode>;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<BlendProps>(
  ({ mode }, children, { Skia }) => {
    const blend = BlendMode[enumKey(mode)];
    if (childrenAreImageFilters(children)) {
      return children.reverse().reduce<SkImageFilter | null>((inner, outer) => {
        if (inner === null) {
          return outer;
        }
        return Skia.ImageFilter.MakeBlend(blend, outer, inner);
      }, null);
    } else if (childrenAreShaders(children)) {
      return children.reverse().reduce<SkShader | null>((inner, outer) => {
        if (inner === null) {
          return outer;
        }
        return Skia.Shader.MakeBlend(blend, outer, inner);
      }, null);
    }
    throw new Error("<Blend /> can only blend Shaders or ImageFilters");
  }
);

export const Blend = (props: AnimatedProps<BlendProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
