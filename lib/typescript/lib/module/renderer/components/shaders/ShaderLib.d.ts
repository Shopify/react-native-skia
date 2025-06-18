export namespace ShaderLib {
    export { MATH as Math };
    export { COLORS as Colors };
}
declare const MATH: "\nconst float PI = 3.1415926535897932384626433832795;\nconst float TAU = 2 * PI;\n\nfloat normalizeRad(float value) {\n  float rest = mod(value, TAU);\n  return rest > 0 ? rest : TAU + rest;\n}\n\nvec2 canvas2Cartesian(vec2 v, vec2 center) {\n  return vec2(v.x - center.x, -1 * (v.y - center.y));\n}\n\nvec2 cartesian2Canvas(vec2 v, vec2 center) {\n  return vec2(v.x + center.x, -1 * v.y + center.y);\n}\n\nvec2 cartesian2Polar(vec2 v) {\n  return vec2(atan(v.y, v.x), sqrt(v.x * v.x + v.y * v.y));\n}\n\nvec2 polar2Cartesian(vec2 p) {\n  return vec2(p.y * cos(p.x), p.y * sin(p.x));\n}\n\nvec2 polar2Canvas(vec2 p, vec2 center) {\n  return cartesian2Canvas(polar2Cartesian(p), center);\n}\n\nvec2 canvas2Polar(vec2 v, vec2 center) {\n  return cartesian2Polar(canvas2Cartesian(v, center));\n}\n";
declare const COLORS: "\nvec4 hsv2rgb(vec3 c) {\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return vec4(c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y), 1.0);\n}\n";
export {};
