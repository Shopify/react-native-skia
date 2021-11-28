import { Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";
import { processColor } from "../processors/Paint";

export interface ColorShaderProps {
  color: string;
}

export const ColorShader = ({ color }: ColorShaderProps) => {
  const onDeclare = useDeclaration(() => {
    return Skia.Shader.MakeColor(processColor(color, 1));
  }, [color]);
  return <skDeclaration onDeclare={onDeclare} />;
};
