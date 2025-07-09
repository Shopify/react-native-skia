import React from "react";

import { frag } from "../../components/ShaderLib";

import { Scene, baseUniforms } from "./components/Scene";

const shader = frag`
${baseUniforms}
uniform mat3 transform;
uniform vec2 resolution;
uniform shader image;
uniform shader blurredImage;

float sdCircle(vec2 p, vec2 center, float radius) {
  vec2 offset = p - center;
  float d = length(offset) - radius;
  return d;
}

float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r ) {
  r.xy = (p.x>0.0) ? r.xy : r.zw;
  r.x  = (p.y>0.0) ? r.x  : r.y;
  vec2 q = abs(p)-b+r.x;
  float d = min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
  return d;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
  return mix(a, b, h) - k*h*(1.0-h);
}

vec2 project(vec2 p, mat3 m) {
  vec3 result =  inverse(m) * vec3(p, 1.0);
  return result.xy;
}

vec4 render(float2 xy) {
  vec2 p = project(xy, transform);
  float2 uv = p / resolution.xy;
  float circleRadius = r * (1.0 - smoothstep(0.8, 1.0, progress));
  float sdf1 = sdCircle(p + vec2(0, -r), c1, circleRadius);
  float sdf2 = sdRoundedBox(p - box.xy - box.zw * 0.5, box.zw * 0.5, vec4(r));
  float k = 20 + 20 * (1.0 - abs(2.0 * progress - 1.0));
  float d = smin(sdf1, sdf2, k);
  
  // Calculate the blend factor used in smin to interpolate t
  float h = clamp(0.5 + 0.5*(sdf1 - sdf2)/k, 0.0, 1.0);

  if (d > 0.0) {
    return image.eval(xy);
  } else {
    return blurredImage.eval(xy);
  }
}

vec4 main(vec2 fragCoord) {
  // Anti-aliasing settings
  const int samples = 4;
  float sampleStrength = 1.0/float(samples*samples);
  vec4 finalColor = vec4(0.0);
  
  // Perform supersampling
  for(int m = 0; m < samples; m++) {
    for(int n = 0; n < samples; n++) {
      // Calculate offset for this sample (only if using AA)
      vec2 offset = (samples > 1) ? 
          (vec2(float(m), float(n)) / float(samples) - 0.5/float(samples)) : 
          vec2(0.0);
      
      // Get pixel position with the offset
      vec2 p = fragCoord + offset;
      
      // Render this sample
      vec4 color = render(p);
      // Accumulate color
      finalColor += color * sampleStrength;
    }
  }
  
  return finalColor;
}`;

export const Shader1 = () => {
  return <Scene shader={shader} />;
};
