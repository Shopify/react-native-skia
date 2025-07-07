import type {
  SkRect,
  SkRuntimeEffect,
  Uniforms,
} from "@shopify/react-native-skia";
import {
  BlendMode,
  processTransform2d,
  processUniforms,
  Skia,
  TileMode,
} from "@shopify/react-native-skia";
import React from "react";

import { Scene } from "./components/Scene";

export const LiquidShape = () => {
  const filter = (
    bounds: SkRect,
    source: SkRuntimeEffect,
    uniforms: number[]
  ) => {
    "worklet";
    const localMatrix = processTransform2d([
      { translateX: bounds.x },
      { translateY: bounds.y },
    ]);
    const shader = Skia.ImageFilter.MakeShader(
      source.makeShader(uniforms, localMatrix)
    );
    const sigma = 12;
    const blur = Skia.ImageFilter.MakeBlur(sigma, sigma, TileMode.Clamp);
    const blendFilter = Skia.ImageFilter.MakeBlend(BlendMode.SrcIn, shader);

    const whiteTint = Skia.Shader.MakeColor(
      Skia.Color("rgba(255, 255, 255, 0.4)")
    );

    return Skia.ImageFilter.MakeCompose(
      blendFilter,
      Skia.ImageFilter.MakeBlend(
        BlendMode.SrcOver,
        blur,
        Skia.ImageFilter.MakeShader(whiteTint)
      )
    );
  };
  return <Scene filter={filter} />;
};
