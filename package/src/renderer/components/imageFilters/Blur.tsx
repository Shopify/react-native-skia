import type { ReactNode } from "react";

import { Skia, TileMode } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isImageFilter } from "../../../skia/ImageFilter/ImageFilter";

export interface BlurProps {
  sigmaX: number;
  sigmaY: number;
  mode: SkEnum<typeof TileMode>;
  children?: ReactNode | ReactNode[];
}

export const Blur = (props: AnimatedProps<BlurProps>) => {
  const declaration = useDeclaration(
    props,
    ({ sigmaX, sigmaY, mode }, children) => {
      const [input] = children.filter(isImageFilter);
      return Skia.ImageFilter.MakeBlur(
        sigmaX,
        sigmaY,
        TileMode[enumKey(mode)],
        input ?? null
      );
    }
  );
  return <skDeclaration declaration={declaration} />;
};

Blur.defaultProps = {
  mode: "decal",
};
