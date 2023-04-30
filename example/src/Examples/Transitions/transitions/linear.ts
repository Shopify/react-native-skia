import { glsl } from "../../../components/ShaderLib";

import type { Transition } from "./Base";

export const linear: Transition = (
  name: string,
  image1: string,
  image2: string
) => glsl`
vec4 ${name}(vec2 uv, float progress) {
  return mix(
    ${image1}(uv),
    ${image2}(uv),
    progress
  );
}
`;
