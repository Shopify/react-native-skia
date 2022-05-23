import React from "react";
import type { ReactNode } from "react";

import { Skia, isColorFilter } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import { composeColorFilter } from "./Compose";

export interface LerpProps {
  t: number;
  children: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<LerpProps>(({ t }, children) => {
  const [src, dst] = children.filter(isColorFilter);
  const cf = Skia.ColorFilter.MakeLerp(t, src, dst);
  return composeColorFilter(
    cf,
    children.filter((c) => c !== src && c !== dst)
  );
});

export const Lerp = (props: AnimatedProps<LerpProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
