import React from "react";

import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isVector } from "../../../skia/types";
import type {
  SkRuntimeEffect,
  Uniforms,
  UniformValue,
} from "../../../skia/types";

import { getInput } from "./getInput";

const processValue = (value: UniformValue): readonly number[] => {
  if (isVector(value)) {
    return [value.x, value.y];
  } else if (typeof value === "number") {
    return [value];
  }
  return value;
};

export interface RuntimeShaderProps {
  source: SkRuntimeEffect;
  uniforms: Uniforms;
}

const onDeclare = createDeclaration<RuntimeShaderProps>(
  ({ source, uniforms }, children, { Skia }) => {
    const rtb = Skia.RuntimeShaderBuilder(source);
    new Array(source.getUniformCount()).fill(0).forEach((_, i) => {
      const name = source.getUniformName(i);
      const value = uniforms[name];
      let flatValue: readonly number[] = [];
      if (value === undefined) {
        throw new Error(`No value specified for uniform ${name}`);
      }
      if (Array.isArray(value)) {
        flatValue = value.flatMap(processValue);
      }
      flatValue = processValue(value as UniformValue);
      rtb.setUniform(name, flatValue);
    });
    return Skia.ImageFilter.MakeRuntimeShader(
      rtb,
      null,
      getInput(Skia, children)
    );
  }
);

export const RuntimeShader = (props: AnimatedProps<RuntimeShaderProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
