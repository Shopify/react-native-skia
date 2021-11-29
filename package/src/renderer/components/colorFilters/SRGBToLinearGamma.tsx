import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SRGBToLinearGammaProps {}

export const SRGBToLinearGamma = (
  props: AnimatedProps<SRGBToLinearGammaProps>
) => {
  const onDeclare = useDeclaration(() => {
    return Skia.ColorFilter.MakeSRGBToLinearGamma();
  }, []);
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
