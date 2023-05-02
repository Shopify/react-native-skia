import { frag } from "../../../components/ShaderLib";

type Options = {
  clamp?: boolean;
};

export type Transition = {
  common?: string;
  transition: (
    name: string,
    image1: string,
    image2: string,
    opt?: Options
  ) => string;
};

const defaultOptions: Options = {
  clamp: true,
};

export const transition = (t: Transition) => {
  const { clamp } = { ...defaultOptions };
  return frag`
  uniform shader image1;
  uniform shader image2;

  uniform float progress;
  uniform float2 resolution;
  
  half4 getColor1(float2 uv) {
    return image1.eval(uv * resolution);
  }
  
  half4 getColor2(float2 uv) {
    return image2.eval(uv * resolution);
  }
  
  ${t.common ?? ""}
  ${t.transition("transition", "getColor1", "getColor2")}

  float clampValue(float value) {
    return ${clamp ? "saturate(value)" : "value"};
  }
  
  half4 main(vec2 xy) {
    vec2 uv = xy / resolution;
    return transition(
      uv,
      clampValue(progress)
    );
  }
  `;
};

export const transition2 = (
  t1: Transition,
  t2: Transition,
  options: Options = {}
) => {
  const { clamp } = { ...defaultOptions, ...options };
  return frag`
uniform shader image1;
uniform shader image2;
uniform shader image3;

uniform float progress;
uniform float2 resolution;

half4 getColor1(float2 uv) {
  return image1.eval(uv * resolution);
}

half4 getColor2(float2 uv) {
  return image2.eval(uv * resolution);
}

half4 getColor3(float2 uv) {
  return image3.eval(uv * resolution);
}

${t1.common ?? ""}
${t2 !== t1 ? t2.common ?? "" : ""}
${t1.transition("transition1", "getColor1", "getColor2")}
${t2.transition("transition2", "getColor2", "getColor3")}

float clampValue(float value) {
  return ${clamp ? "saturate(value)" : "value"};
}

half4 main(vec2 xy) {
  vec2 uv = xy / resolution;
  if (progress > 0) {
    return transition2(
      uv,
      clampValue(progress)
    );
  } else {
    return transition1(
      uv,
      clampValue(mix(progress + 1, 1, 0))
    );
  }
}

`;
};
