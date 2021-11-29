import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";
import { isColorFilter } from "../../../skia/ColorFilter/ColorFilter";

export interface LerpProps {
  t: number;
  children: ReactNode | ReactNode[];
}

export const Lerp = (props: AnimatedProps<LerpProps>) => {
  const onDeclare = useDeclaration(
    (ctx, children) => {
      const { t } = materialize(ctx, props);
      const [src, dst] = children.filter(isColorFilter);
      return Skia.ColorFilter.MakeLerp(t, dst, src);
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
