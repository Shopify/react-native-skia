import { Skia, Shader, vec } from "@exodus/react-native-skia";

import { glsl } from "../ShaderLib";
import { DEV } from "../Theme";

const generateShader = () => {
  const minSigma = 5;
  const maxSigma = 30;
  const k = 3;
  const windowSize = DEV ? 20 : k * maxSigma;
  const halfWindowSize = (windowSize / 2).toFixed(1);
  const source = glsl`
uniform shader image;
uniform mat4 matrix;

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
      // TODO: There is a probably a better way to check if we are out of bounds
      if (image.eval(uv + offset).a == 0.0) {
        continue;
      }
      result += sample * weight;
      totalWeight += weight;
  }

  if (totalWeight > 0.0) {
      result /= totalWeight;
  }

  return result;
}

float normalizeZValue(float z) {
  const float r = 150.0;
  return saturate((z + r) / (2.0 * r));
}

// main function
vec4 main(vec2 xy) {
  vec4 prj = matrix * vec4(xy, 0.0, 1.0);
  float amount = 1-normalizeZValue(prj.z);
  // if (amount == 0.0) {
  //   return image.eval(xy);
  // }
  vec3 color = blur(xy, direction, mix(${minSigma.toFixed(
    1
  )}, ${maxSigma.toFixed(1)}, amount));
  color += vec3(0.05);//mix(vec3(0.1), vec3(0.0), amount);
  return vec4(color, 1.0);
}
`;
  return Skia.RuntimeEffect.Make(source)!;
};

const source = generateShader();

interface VariableBlurProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  matrix: any;
  children: React.ReactNode;
}

export const VariableBlur = ({ matrix, children }: VariableBlurProps) => {
  const hUniforms = {
    direction: vec(1, 0),
    matrix,
  };
  const vUniforms = {
    direction: vec(0, 1),
    matrix,
  };
  return (
    <Shader source={source} uniforms={hUniforms}>
      <Shader source={source} uniforms={vUniforms}>
        {children}
      </Shader>
    </Shader>
  );
};
