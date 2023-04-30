import { glsl } from "../../../components/ShaderLib/Tags";

import type { Transition } from "./Base";

export const zoomInCircles: Transition = (
  name: string,
  getFromColor: string,
  getToColor: string
) => glsl`

struct Context {
 vec2 uv;
 float t;
};

vec2 zoom(vec2 uv, float amount) {
  return 0.5 + ((uv - 0.5) * amount);	
}

Context getUV(vec2 uv, float progress) {
  vec2 r = 2.0 * (vec2(uv.xy) - 0.5);
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
  return Context(uv, t);
}

vec4 ${name}(vec2 uv, float progress) {
  Context result = getUV(uv, progress);
  return mix(${getFromColor}(result.uv), ${getToColor}(result.uv), result.t);
}
`;
