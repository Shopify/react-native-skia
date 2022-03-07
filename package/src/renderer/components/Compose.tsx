import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../skia";
import { createDeclaration } from "../nodes/Declaration";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { isColorFilter } from "../../skia/ColorFilter/ColorFilter";
import { isImageFilter } from "../../skia/ImageFilter/ImageFilter";

export interface ComposeProps {
  children: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration((_, children) => {
  const [inner, outer] = children;
  if (isColorFilter(outer) && isColorFilter(inner)) {
    return Skia.ColorFilter.MakeCompose(outer, inner);
  } else if (isImageFilter(outer) && isImageFilter(inner)) {
    return Skia.ImageFilter.MakeCompose(outer, inner);
  }
  throw new Error(
    "ComposeFilter can only compose ColorFilters and ImageFilters"
  );
});

export const Compose = (props: AnimatedProps<ComposeProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
