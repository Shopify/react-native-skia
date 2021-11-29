import { BlendMode, Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum, ColorProp } from "../../processors/Paint";
import { enumKey } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface BlendColorProps {
  mode: SkEnum<typeof BlendMode>;
  color: ColorProp;
}

export const BlendColor = (props: AnimatedProps<BlendColorProps>) => {
  const declaration = useDeclaration(props, ({ mode, color }) => {
    return Skia.ColorFilter.MakeBlend(
      Skia.Color(color),
      BlendMode[enumKey(mode)]
    );
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
