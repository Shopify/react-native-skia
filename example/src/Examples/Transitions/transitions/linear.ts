import { glsl } from "../../../components/ShaderLib";

export const linear = glsl`
vec4 linear1(vec2 uv) {
  return mix(
    getColor1(uv),
    getColor2(uv),
    p1
  );
}

vec4 linear2(vec2 uv) {
  return mix(
    getColor1(uv),
    getColor3(uv),
    p2
  );
}

`;
