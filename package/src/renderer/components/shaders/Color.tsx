import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { ColorProp } from "../../processors/Paint";
import { processColor } from "../../processors/Paint";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";

export interface ColorShaderProps {
  color: ColorProp;
}

export const ColorShader = (props: AnimatedProps<ColorShaderProps>) => {
  const onDeclare = useDeclaration(
    (ctx) => {
      const { color } = materialize(ctx, props);
      return Skia.Shader.MakeColor(processColor(color, 1));
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};
