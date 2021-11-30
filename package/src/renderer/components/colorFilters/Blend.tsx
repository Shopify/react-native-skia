import type { ReactNode } from "react";

import { BlendMode, Skia, isColorFilter } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum, ColorProp } from "../../processors/Paint";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface BlendProps {
  mode: SkEnum<typeof BlendMode>;
  color: ColorProp;
  children?: ReactNode | ReactNode[];
}

export const Blend = (props: AnimatedProps<BlendProps>) => {
  const declaration = useDeclaration(props, ({ mode, color }, children) => {
    const [child] = children.filter(isColorFilter);
    const cf = Skia.ColorFilter.MakeBlend(
      Skia.Color(color),
      BlendMode[enumKey(mode)]
    );
    if (child) {
      return Skia.ColorFilter.MakeCompose(cf, child);
    }
    return cf;
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
