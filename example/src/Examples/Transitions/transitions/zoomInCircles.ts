import { glsl } from "../../../components/ShaderLib/Tags";

export const zoomInCircles = glsl`
// License: MIT
// Author: dycm8009
// ported by gre from https://gist.github.com/dycm8009/948e99b1800e81ad909a

vec2 zoom(vec2 uv, float amount) {
  return 0.5 + ((uv - 0.5) * amount);	
}

vec2 ratio2 = vec2(1.0, 1.0 / 1.0);

vec4 zoomInCircles(vec2 uv) {
  // TODO: some timing are hardcoded but should be one or many parameters
  // TODO: should also be able to configure how much circles
  // TODO: if() branching should be avoided when possible, prefer use of step() & other functions
  vec2 r = 2.0 * ((vec2(uv.xy) - 0.5) * ratio2);
  float pro = progress / 0.8;
  float z = pro * 0.2;
  float t = 0.0;
  if (pro > 1.0) {
    z = 0.2 + (pro - 1.0) * 5.;
    t = clamp((progress - 0.8) / 0.07, 0.0, 1.0);
  }
  if (length(r) < 0.5+z) {
    // uv = zoom(uv, 0.9 - 0.1 * pro);
  }
  else if (length(r) < 0.8+z*1.5) {
    uv = zoom(uv, 1.0 - 0.15 * pro);
    t = t * 0.5;
  }
  else if (length(r) < 1.2+z*2.5) {
    uv = zoom(uv, 1.0 - 0.2 * pro);
    t = t * 0.2;
  }
  else {
    uv = zoom(uv, 1.0 - 0.25 * pro);
  }
  return mix(getFromColor(uv), getToColor(uv), t);
}
`;
