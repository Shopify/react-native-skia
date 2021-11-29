import type { ReactNode } from "react";

import { Skia, TileMode } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";
import { isImageFilter } from "../../../skia/ImageFilter/ImageFilter";

export interface BlurImageProps {
  sigmaX: number;
  sigmaY: number;
  mode: SkEnum<typeof TileMode>;
  children: ReactNode | ReactNode[];
}

export const BlurImage = (props: AnimatedProps<BlurImageProps>) => {
  const onDeclare = useDeclaration(
    (ctx, children) => {
      const { sigmaX, sigmaY, mode } = materialize(ctx, props);
      const [input] = children.filter(isImageFilter);
      return Skia.ImageFilter.MakeBlur(
        sigmaX,
        sigmaY,
        TileMode[enumKey(mode)],
        input ?? null
      );
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};
