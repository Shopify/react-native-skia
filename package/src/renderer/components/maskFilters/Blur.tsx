import { BlurStyle } from "../../../skia/MaskFilter";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";

export interface BlurProps {
  style: SkEnum<typeof BlurStyle>;
  sigma: number;
}

export const Blur = (props: AnimatedProps<BlurProps>) => {
  const onDeclare = useDeclaration(
    (ctx) => {
      const { style, sigma } = materialize(ctx, props);
      return Skia.MaskFilter.MakeBlur(BlurStyle[enumKey(style)], sigma, false);
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};
