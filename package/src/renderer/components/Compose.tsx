import type { ReactNode } from "react";

import type { SkiaProps } from "../processors/Animations/Animations";

export interface ComposeProps {
  children: ReactNode | ReactNode[];
}

// const onDeclare = createDeclaration((_, children, { Skia }) => {
//   const [inner, outer] = children;
//   if (isColorFilter(outer) && isColorFilter(inner)) {
//     return Skia.ColorFilter.MakeCompose(outer, inner);
//   } else if (isImageFilter(outer) && isImageFilter(inner)) {
//     return Skia.ImageFilter.MakeCompose(outer, inner);
//   }
//   throw new Error(
//     "ComposeFilter can only compose ColorFilters and ImageFilters"
//   );
// });

// TODO: implement
export const Compose = (_props: SkiaProps<ComposeProps>) => {
  throw new Error("Not implemented yet");
};
