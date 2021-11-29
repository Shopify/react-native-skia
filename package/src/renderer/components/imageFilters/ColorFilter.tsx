import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isImageFilter } from "../../../skia/ImageFilter/ImageFilter";
import { isColorFilter } from "../../../skia/ColorFilter/ColorFilter";

export interface ColorFilterProps {
  children: ReactNode | ReactNode[];
}

export const ColorFilter = (props: AnimatedProps<ColorFilterProps>) => {
  const onDeclare = useDeclaration((_, children) => {
    const [cf] = children.filter(isColorFilter);
    const [input] = children.filter(isImageFilter);
    return Skia.ImageFilter.MakeColorFilter(cf, input ?? null);
  }, []);
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
