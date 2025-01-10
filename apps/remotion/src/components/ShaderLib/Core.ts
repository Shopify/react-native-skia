import { glsl } from "./Tags";

export const Core = glsl`
const float PI = ${Math.PI};
const vec4 TRANSPARENT = vec4(0., 0., 0., 0.);


mat3 translate(vec2 p) {
  return mat3(1.0,0.0,0.0,0.0,1.0,0.0,p.x,p.y,1.0);
}

mat3 scale(vec2 s, vec2 p) {
  return translate(p) * mat3(s.x,0.0,0.0,0.0,s.y,0.0,0.0,0.0,1.0) * translate(-p);
}

vec2 project(vec2 p, mat3 m) {
  return (inverse(m) * vec3(p, 1.)).xy;
}

struct Paint {
  half4 color;
  bool stroke;
  float strokeWidth;
  int blendMode;
};

struct Context  {
  half4 color;
  float2 p;
  float2 resolution;
};

Paint createStroke(half4 color, float strokeWidth) {
  return Paint(color, true, strokeWidth, 0);
}

Paint createFill(half4 color) {
  return Paint(color, false, 0, 0);
}

// https://github.com/google/skia/blob/1f193df9b393d50da39570dab77a0bb5d28ec8ef/src/sksl/sksl_gpu.sksl
half4 blendSrcOver(half4 src, half4 dst) { return src + (1 - src.a)*dst; }
half4 blendDarken(half4 src, half4 dst) {
  half4 result = blendSrcOver(src, dst);
  result.rgb = min(result.rgb, (1 - dst.a)*src.rgb + dst.rgb);
  return result;
}

half4 blend(Context ctx, Paint paint) {
  return blendDarken(ctx.color, paint.color);
}

float sdLine(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = saturate(dot(pa, ba) / dot(ba, ba));
  return length(pa - ba * h);
}

float sdRRect(in vec2 p, in vec2 b, in vec4 r) {
  r.xy = (p.x>0.0)?r.xy : r.zw;
  r.x  = (p.y>0.0)?r.x  : r.y;
  vec2 q = abs(p)-b+r.x;
  return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

float sdRect(vec2 p, vec2 b) {
  vec2 d = abs(p)-b;
  return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float4 draw(inout Context ctx, float d, Paint paint) {
  bool isFill = !paint.stroke && d < 0;
  bool isStroke = paint.stroke && abs(d) < paint.strokeWidth/2;
  if (isFill || isStroke) {
    ctx.color = blend(ctx, paint);
  }
  return TRANSPARENT;
}

void drawLine(inout Context ctx, float2 a, float2 b, Paint paint) {
  float d = sdLine(ctx.p, a, b);
  draw(ctx, d, paint); 
}

void drawRect(inout Context ctx, float4 rect, Paint paint) {
  vec2 p = (2.0*ctx.p-ctx.resolution)/ctx.resolution;
  float2 wh = rect.zw - rect.xy;
  float d = sdRect(p, wh/ctx.resolution.xy);
  draw(ctx, d, paint); 
}

void drawRRect(inout Context ctx, float4 rect, float4 r, Paint paint) {
  vec2 p = (2.0*ctx.p-ctx.resolution)/ctx.resolution;
  float2 wh = rect.zw - rect.xy;
  float d = sdRRect(p, wh/ctx.resolution.xy,vec4(3)/r);
  draw(ctx, d, paint); 
}
`;
