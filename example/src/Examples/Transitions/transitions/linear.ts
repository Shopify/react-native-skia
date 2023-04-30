import { glsl } from "../../../components/ShaderLib";

export const linear = glsl`
vec4 linear(vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}`;
