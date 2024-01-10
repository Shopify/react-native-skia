import React from "react";
import type { SkMatrix } from "@shopify/react-native-skia";
import { RuntimeShader, vec } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-gesture-handler/lib/typescript/handlers/gestures/reanimatedWrapper";
import { useDerivedValue } from "react-native-reanimated";

import { generateShader } from "./Shader";

const source = generateShader();

interface BlurGradientProps {
  matrix: SharedValue<SkMatrix>;
}

export const BlurMask = ({ matrix }: BlurGradientProps) => {
  const hUniforms = useDerivedValue(() => {
    return {
      direction: vec(1, 0),
      matrix: matrix.value.get(),
    };
  });
  const vUniforms = useDerivedValue(() => {
    return {
      direction: vec(0, 1),
      matrix: matrix.value.get(),
    };
  });
  return (
    <RuntimeShader source={source} uniforms={hUniforms}>
      <RuntimeShader source={source} uniforms={vUniforms} />
    </RuntimeShader>
  );
};
