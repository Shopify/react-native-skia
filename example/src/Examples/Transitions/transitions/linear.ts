import { glsl } from "../../../components/ShaderLib";

import type { Transition } from "./Base";

export const linear: Transition = (
  name: string,
  getFromColor: string,
  getToColor: string
) => glsl`
vec4 ${name}(vec2 uv, float progress) {
  return mix(
    ${getFromColor}(uv),
    ${getToColor}(uv),
    progress
  );
}
`;
