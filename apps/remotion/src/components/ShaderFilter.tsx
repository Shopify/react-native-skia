import type {
  SkRect,
  SkRuntimeEffect,
  TileMode,
} from "@exodus/react-native-skia";
import type { ReactNode } from "react";

interface ShaderFilterProps {
  rect: SkRect;
  children?: ReactNode | ReactNode[];
  shader?: SkRuntimeEffect;
  tileMode?: TileMode;
  uniforms?: number[];
}

export const ShaderFilter = (props: ShaderFilterProps) => {
  return props.children;
};
