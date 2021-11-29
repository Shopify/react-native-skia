import { BlendMode, Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum, ColorProp } from "../../processors/Paint";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";

export interface BlendColorProps {
  mode: SkEnum<typeof BlendMode>;
  color: ColorProp;
}

export const BlendColor = (props: AnimatedProps<BlendColorProps>) => {
  const onDeclare = useDeclaration(
    (ctx) => {
      const { mode, color } = materialize(ctx, props);
      return Skia.ColorFilter.MakeBlend(
        Skia.Color(color),
        BlendMode[enumKey(mode)]
      );
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
