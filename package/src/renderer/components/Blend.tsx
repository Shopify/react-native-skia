import type { ReactNode } from "react";

import type { SkEnum } from "../../dom/types";
import type { BlendMode } from "../../skia";
import type { AnimatedProps } from "../processors";
// const childrenAreImageFilters = (
//   children: DeclarationResult[]
// ): children is SkImageFilter[] =>
//   children.every((child) => isImageFilter(child));

// const childrenAreShaders = (
//   children: DeclarationResult[]
// ): children is SkShader[] => children.every((child) => isShader(child));

interface BlendProps {
  mode: SkEnum<typeof BlendMode>;
  children?: ReactNode | ReactNode[];
}

// const onDeclare = createDeclaration<BlendProps>(
//   ({ mode }, children, { Skia }) => {
//     const blend = BlendMode[enumKey(mode)];
//     if (childrenAreImageFilters(children)) {
//       return children.reverse().reduce<SkImageFilter | null>((inner, outer) => {
//         if (inner === null) {
//           return outer;
//         }
//         return Skia.ImageFilter.MakeBlend(blend, outer, inner);
//       }, null);
//     } else if (childrenAreShaders(children)) {
//       return children.reverse().reduce<SkShader | null>((inner, outer) => {
//         if (inner === null) {
//           return outer;
//         }
//         return Skia.Shader.MakeBlend(blend, outer, inner);
//       }, null);
//     }
//     throw new Error("<Blend /> can only blend Shaders or ImageFilters");
//   }
// );

// TODO: implement
export const Blend = (_props: AnimatedProps<BlendProps>) => {
  throw new Error("Not implemented yet");
};
