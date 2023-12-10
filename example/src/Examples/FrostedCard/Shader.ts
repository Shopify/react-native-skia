import { Skia } from "@shopify/react-native-skia";

import { glsl } from "../../components/ShaderLib";

export const generateShader = () => {
  const maxSigma = 10;
  const k = 3;
  const windowSize = k * maxSigma;
  const halfWindowSize = (windowSize / 2).toFixed(1);
  const source = glsl`
uniform shader image;
uniform mat3 matrix;

uniform float2 direction;

// Function to calculate Gaussian weight
float Gaussian(float x, float sigma) {
  return exp(-(x * x) / (2.0 * sigma * sigma)) / (2.0 * 3.14159 * sigma * sigma);
}

// Function to perform blur in one direction
vec3 blur(vec2 uv, vec2 direction, float sigma) {
  vec3 result = vec3(0.0);
  float totalWeight = 0.0;
  float window = sigma * ${k.toFixed(1)} * 0.5;

  for (float i = ${-halfWindowSize}; i <= ${halfWindowSize}; i++) {
      if (abs(i) > window) {
        continue;
      }
      float weight = Gaussian(i, sigma);
      vec2 offset = vec2(direction * i);
      vec3 sample = image.eval(uv + offset).rgb;

      result += sample * weight;
      totalWeight += weight;
  }

  if (totalWeight > 0.0) {
      result /= totalWeight;
  }

  return result;
}

// main function
vec4 main(vec2 xy) {
  vec3 prj = matrix * vec3(xy, 1.0);
  float amount = clamp(prj.z/200.0, 0.0, 1.0);
  if (amount == 0.0) {
    return image.eval(xy);
  }
  vec3 color = blur(xy, direction, mix(0.1, ${maxSigma.toFixed(1)}, amount));
  return vec4(color, 1.0);
}
`;
  return Skia.RuntimeEffect.Make(source)!;
};
