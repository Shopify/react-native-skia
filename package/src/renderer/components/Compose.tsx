import type { ReactNode } from "react";

import { Skia } from "../../skia";
import { useDeclaration } from "../nodes/Declaration";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { isColorFilter } from "../../skia/ColorFilter/ColorFilter";
import { isImageFilter } from "../../skia/ImageFilter/ImageFilter";

export interface ComposeProps {
  children: ReactNode | ReactNode[];
}

export const ComposeFilter = (props: AnimatedProps<ComposeProps>) => {
  const onDeclare = useDeclaration((_, children) => {
    const [outer, inner] = children;
    if (isColorFilter(outer) && isColorFilter(inner)) {
      return Skia.ColorFilter.MakeCompose(outer, inner);
    } else if (isImageFilter(outer) && isImageFilter(inner)) {
      return Skia.ImageFilter.MakeCompose(outer, inner);
    }
    throw new Error(
      "ComposeFilter can only compose ColorFilters and ImageFilters"
    );
  }, []);
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
