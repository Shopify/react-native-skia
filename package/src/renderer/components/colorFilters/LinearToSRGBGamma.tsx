import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LinearToSRGBGammaProps {}

export const LinearToSRGBGamma = (
  props: AnimatedProps<LinearToSRGBGammaProps>
) => {
  const onDeclare = useDeclaration(() => {
    return Skia.ColorFilter.MakeLinearToSRGBGamma();
  }, []);
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
