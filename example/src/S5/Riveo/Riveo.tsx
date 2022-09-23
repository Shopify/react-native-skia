import {
  useTouchHandler,
  vec,
  useValue,
  Canvas,
  Fill,
  ImageShader,
  rect,
  Shader,
  Skia,
  useImage,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform vec2 pointer;
uniform vec2 origin;
uniform vec2 resolution;

const float PI = 3.1415926535897932384626433832795;
const float r = 50.0;

vec4 point(vec2 v, vec2 xy, vec4 cl) {
  if (distance(xy, v) < 5) {
    return vec4(0, 0, 1, 1);
  }
  return cl;
}

vec2 rotate(vec2 point, vec2 pivot, float angle) {
    float dx = point.x - pivot.x;
    float dy = point.y - pivot.y;
    float x = pivot.x + dx * cos(angle) - dy * sin(angle);
    float y = pivot.y + dx * sin(angle) + dy * cos(angle);
    return vec2(x, y);
}


// https://www.youtube.com/watch?v=D_Zq6q1gnvw&t=158s
vec4 line(vec2 a, vec2 b, vec2 p, vec4 cl) {
  vec2 ba = b - a;
  vec2 pa = p - a;
  //float k = clamp(dot(ba, pa) / dot(ba, ba), 0.0, 1.0);
  float k = dot(ba, pa) / dot(ba, ba);
  float d = length(pa - ba * k);
  if (d < 5) {
    return vec4(0.3, 0.6, 1.0, 1.0);
  }
  return cl;
}

vec4 main(float2 xy) {
  vec4 cl = vec4(0, 0, 0, 1);
  float dx = origin.x - pointer.x;
  float x = resolution.x - dx;
  float d = xy.x - x;
  cl = image.eval(xy);
  if (origin == vec2(0., 0.) || pointer == vec2(0., 0.)) {
    return cl;
  }
  if (d > r) {
    cl = vec4(1.0, 0.0, 0.0, 1.0);
    cl.rgb *= pow(clamp(d - r, 0., 1.) * 1.5, .2);
  } else if (d > 0) {
    float theta = asin(d / r);
    float d1 = theta * r;
    float d2 = (PI - theta) * r;
    vec2 p1 = vec2(x + d1, xy.y);
    vec2 p2 = vec2(x + d2, xy.y);
    cl = image.eval((p2.x > 0. && p2.y > 0. && p2.x <= resolution.x && p2.y <= resolution.y) ? p2 : p1);
    cl.rgb *= pow(clamp((r - d) / r, 0., 1.), .2);
  } else {
    vec2 p = vec2(x + abs(d) + PI * r, xy.y);
    cl = image.eval((p.x > 0. && p.y > 0. && p.x <= resolution.x && p.y <= resolution.y) ? p : xy);
  }
  //cl = line(vec2(x, 0), vec2(x, resolution.y), xy, cl);
  return cl;
}`)!;

const defaultUniforms = {
  pointer: vec(0, 0),
  origin: vec(0, 0),
  resolution: vec(width, height),
};

export const Riveo = () => {
  const uniforms = useValue(defaultUniforms);
  const oslo = useImage(require("../../assets/oslo.jpg"));
  const onTouch = useTouchHandler({
    onStart: ({ y, x }) => {
      uniforms.current = { ...uniforms.current, origin: vec(x, y) };
    },
    onActive: ({ x, y }) => {
      uniforms.current = { ...uniforms.current, pointer: vec(x, y) };
    },
    onEnd: () => {
      uniforms.current = defaultUniforms;
    },
  });
  if (oslo === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch}>
      <Fill color="cyan" />
      <Fill>
        <Shader source={source} uniforms={uniforms}>
          <ImageShader
            image={oslo}
            fit="cover"
            rect={rect(0, 0, width, height)}
          />
        </Shader>
      </Fill>
    </Canvas>
  );
};
