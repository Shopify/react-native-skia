import React from "react";

import { frag } from "../../components/ShaderLib";

import { Scene } from "./components/Scene";

const shader = frag`
uniform shader image;

vec4 main(float2 p) {
  return image.eval(p).bbga;
}`;

export const Shader2 = () => {
  return <Scene shader={shader} />;
};
