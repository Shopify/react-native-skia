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

float sdf(vec2 xy) {
  vec2 p = project(xy, transform);
  float circleRadius = r * (1.0 - smoothstep(0.8, 1.0, progress));
  float sdf1 = sdCircle(p + vec2(0, -r), c1, circleRadius);
  float sdf2 = sdRoundedBox(p - box.xy - box.zw * 0.5, box.zw * 0.5, vec4(r));
  float k = 20 + 20 * (1.0 - abs(2.0 * progress - 1.0));
  float d = smin(sdf1, sdf2, k);
  return d;
}


// Gradient calculation using finite differences
vec2 calculateGradient(vec2 p) {
    const float epsilon = 0.001;
    float dx = sdf(p + vec2(epsilon, 0.0)) - sdf(p - vec2(epsilon, 0.0));
    float dy = sdf(p + vec2(0.0, epsilon)) - sdf(p - vec2(0.0, epsilon));
    return vec2(dx, dy) / (2.0 * epsilon);
}


// Thickness is the t in the doc.
vec3 getNormal(float sd, vec2 gradient, float thickness)
{
    float dx = gradient.x;
    float dy = gradient.y;
    // The cosine and sine between normal and the xy plane.
    float n_cos = max(thickness + sd, 0.0) / thickness;
    float n_sin = sqrt(1.0 - n_cos * n_cos);
    return normalize(vec3(dx * n_cos, dy * n_cos, n_sin));
}

// The height (z component) of the pad surface at sd.
float height(float sd, float thickness)
{
    if(sd >= 0.0)
    {
        return 0.0;
    }
    if(sd < -thickness)
    {
        return thickness;
    }
    float x = thickness + sd;
    return sqrt(thickness * thickness - x * x);
}


// Isolated liquid glass effect calculation
vec4 calculateLiquidGlass(float sd, vec2 g, vec2 fragCoord)
{
    float thickness = 10.0;
    float index = 1.5;
    float base_height = thickness * 8.0;
    float color_mix = 0.3;
    vec4 color_base = vec4(1.0, 1.0, 1.0, 0.0);
    
    vec3 normal = getNormal(sd, g, thickness);
    
    // A ray going -z hits the top of the pad, where would it hit on
    // the z = -base_height plane?
    vec3 incident = vec3(0.0, 0.0, -1.0); // Should be normalized.
    vec3 refract_vec = refract(incident, normal, 1.0/index);
    float h = height(sd, thickness);
    float refract_length = (h + base_height) /
        dot(vec3(0.0, 0.0, -1.0), refract_vec);
    // This is the screen coord of the ray hitting the z = -base_height
    // plane.
    vec2 coord1 = fragCoord + refract_vec.xy * refract_length;
    vec4 refract_color = blurredImage.eval(coord1);
    
    // Reflection
    vec3 reflect_vec = reflect(incident, normal);
    vec4 reflect_color = vec4(0.0);
    float c = clamp(abs(reflect_vec.x - reflect_vec.y), 0.0, 1.0);
    reflect_color = vec4(c,c,c, 0.0);
    
    return mix(mix(refract_color, reflect_color, (1.0 - normal.z) * 2.0),
               color_base, color_mix);
}

vec4 render(vec2 xy) {
  vec2 p = project(xy, transform);
  float d = sdf(xy);
  float2 g = calculateGradient(p);
  if (d > 0.0) {
    return image.eval(xy);
  } else {
    return calculateLiquidGlass(d, g, xy);
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
