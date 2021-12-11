const MATH = `
const float PI = 3.1415926535897932384626433832795;
const float TAU = 2 * PI;

float normalizeRad(float value) {
  float rest = mod(value, TAU);
  return rest > 0 ? rest : TAU + rest;
}

vec2 canvas2Cartesian(vec2 v, vec2 center) {
  return vec2(v.x - center.x, -1 * (v.y - center.y));
}

vec2 cartesian2Canvas(vec2 v, vec2 center) {
  return vec2(v.x + center.x, -1 * v.y + center.y);
}

vec2 cartesian2Polar(vec2 v) {
  return vec2(atan(v.y, v.x), sqrt(v.x * v.x + v.y * v.y));
}

vec2 polar2Cartesian(vec2 p) {
  return vec2(p.y * cos(p.x), p.y * sin(p.x));
}

vec2 polar2Canvas(vec2 p, vec2 center) {
  return cartesian2Canvas(polar2Cartesian(p), center);
}

vec2 canvas2Polar(vec2 v, vec2 center) {
  return cartesian2Polar(canvas2Cartesian(v, center));
}
`;

const COLORS = `
vec4 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return vec4(c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y), 1.0);
}
`;

export const ShaderLib = {
  Math: MATH,
  Colors: COLORS,
};
