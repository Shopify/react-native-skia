import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isColorFilter } from "../../../skia/ColorFilter/ColorFilter";

export interface LerpProps {
  t: number;
  children: ReactNode | ReactNode[];
}

export const Lerp = (props: AnimatedProps<LerpProps>) => {
  const declaration = useDeclaration(props, ({ t }, children) => {
    const [src, dst, child] = children.filter(isColorFilter);
    const cf = Skia.ColorFilter.MakeLerp(t, dst, src);
    if (child) {
      return Skia.ColorFilter.MakeCompose(cf, child);
    }
    return cf;
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
