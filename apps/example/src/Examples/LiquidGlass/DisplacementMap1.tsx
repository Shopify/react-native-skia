import type { SkShader } from "@shopify/react-native-skia";
import {
  BlendMode,
  ColorChannel,
  Skia,
  TileMode,
} from "@shopify/react-native-skia";
import React from "react";

import { Scene } from "./components/Scene";

// Convert SVG glass distortion filter to Skia ImageFilter
const createGlassDistortionFilter = () => {
  "worklet";
  // Step 1: Create fractal noise (equivalent to feTurbulence)
  const noiseShader = Skia.Shader.MakeFractalNoise(
    0.01, // baseFreqX
    0.01, // baseFreqY
    1, // octaves (numOctaves="1")
    5, // seed
    0, // tileW (0 means no tiling)
    0 // tileH (0 means no tiling)
  );

  // Convert noise shader to image filter
  const turbulenceFilter = Skia.ImageFilter.MakeShader(noiseShader);

  // Step 2: Apply Gaussian blur to create soft displacement map (equivalent to feGaussianBlur)
  const softMapFilter = Skia.ImageFilter.MakeBlur(
    3, // sigmaX (stdDeviation="3")
    3, // sigmaY (stdDeviation="3")
    TileMode.Clamp, // tile mode for blur
    turbulenceFilter
  );

  // Step 3: Create specular lighting (equivalent to feSpecularLighting)
  const specularFilter = Skia.ImageFilter.MakePointLitSpecular(
    { x: -200, y: -200, z: 300 }, // location (fePointLight position)
    Skia.Color("white"), // lightColor (white)
    5, // surfaceScale
    1, // ks (specularConstant)
    100, // shininess (specularExponent)
    softMapFilter
  );

  // Step 4: Composite the specular lighting (equivalent to feComposite with arithmetic)
  // The SVG uses k1="0", k2="1", k3="1", k4="0" which means: 1*foreground + 1*background
  const compositedFilter = Skia.ImageFilter.MakeArithmetic(
    0, // k1
    1, // k2
    1, // k3
    0, // k4
    false, // enforcePMColor
    softMapFilter, // background (the soft map)
    specularFilter // foreground (the specular lighting)
  );

  // Step 5: Apply displacement mapping (equivalent to feDisplacementMap)
  const finalFilter = Skia.ImageFilter.MakeDisplacementMap(
    ColorChannel.R, // xChannelSelector="R"
    ColorChannel.G, // yChannelSelector="G"
    150, // scale
    softMapFilter, // displacement map (in2="softMap")
    null // input (SourceGraphic - will use dynamic source)
  );

  return finalFilter;
};

// Alternative implementation with more explicit component transfer
const createGlassDistortionFilterAdvanced = () => {
  "worklet";
  // Step 1: Create fractal noise
  const noiseShader = Skia.Shader.MakeFractalNoise(0.01, 0.01, 1, 5, 0, 0);
  const turbulenceFilter = Skia.ImageFilter.MakeShader(noiseShader);

  // Note: The feComponentTransfer in the SVG modifies the noise channels:
  // - R channel: gamma correction with amplitude=1, exponent=10, offset=0.5
  // - G channel: zeroed out (amplitude=0)
  // - B channel: offset to 0.5
  //
  // This is complex to replicate exactly in Skia without custom shaders,
  // but the displacement effect mainly uses R and G channels, so we can
  // work with the base fractal noise for similar results.

  // Step 2: Blur for soft displacement map
  const softMapFilter = Skia.ImageFilter.MakeBlur(
    3,
    3,
    TileMode.Clamp,
    turbulenceFilter
  );

  // Step 3: Specular lighting
  const specularFilter = Skia.ImageFilter.MakePointLitSpecular(
    { x: -200, y: -200, z: 300 },
    Skia.Color("white"), // white light
    5, // surfaceScale
    1, // specularConstant
    100, // specularExponent
    softMapFilter
  );

  // Step 4: Arithmetic composite
  const compositedFilter = Skia.ImageFilter.MakeArithmetic(
    0,
    1,
    1,
    0, // k1=0, k2=1, k3=1, k4=0
    false,
    softMapFilter,
    specularFilter
  );

  // Step 5: Final displacement using the composited result
  const displacementFilter = Skia.ImageFilter.MakeDisplacementMap(
    ColorChannel.R,
    ColorChannel.G,
    150,
    compositedFilter, // Use the composited filter result as displacement map
    null // Will use source graphic
  );

  return displacementFilter;
};

export const DisplacementMap1 = () => {
  const filter = (baseShader: SkShader) => {
    "worklet";
    return createGlassDistortionFilterAdvanced();
    // const shader = Skia.ImageFilter.MakeShader(baseShader);
    // const sigma = 12;
    // const blur = Skia.ImageFilter.MakeBlur(sigma, sigma, TileMode.Clamp);
    // const blendFilter = Skia.ImageFilter.MakeBlend(BlendMode.SrcIn, shader);

    // const whiteTint = Skia.Shader.MakeColor(
    //   Skia.Color("rgba(255, 255, 255, 0.4)")
    // );

    // return Skia.ImageFilter.MakeCompose(
    //   blendFilter,
    //   Skia.ImageFilter.MakeBlend(
    //     BlendMode.SrcOver,
    //     blur,
    //     Skia.ImageFilter.MakeShader(whiteTint)
    //   )
    // );
  };
  return <Scene filter={filter} />;
};
