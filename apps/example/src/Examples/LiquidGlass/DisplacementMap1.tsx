import {
  BackdropFilter,
  Canvas,
  DisplacementMap,
  Fill,
  Group,
  Image,
  rect,
  Shader,
  useImage,
} from "@shopify/react-native-skia";
import React, { useState } from "react";
import { useDerivedValue, withSpring } from "react-native-reanimated";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { frag } from "../../components/ShaderLib";

import { useButtonGroup } from "./components/ButtonGroup";

const source = frag`
uniform float progress;
uniform vec2 c1;
uniform vec4 box;
uniform float r;

vec2 sdCircle(vec2 p, vec2 center, float radius) {
  vec2 offset = p - center;
  float d = length(offset) - radius;
  float t = atan(offset.y, offset.x) / (2.0 * 3.14159265) + 0.5;
  return vec2(d, t);
}

vec2 sdRoundedBox( in vec2 p, in vec2 b, in vec4 r ) {
  r.xy = (p.x>0.0) ? r.xy : r.zw;
  r.x  = (p.y>0.0) ? r.x  : r.y;
  vec2 q = abs(p)-b+r.x;
  float d = min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
  
  // Approximate arc length using ellipse parameterization
  vec2 ellipseB = b + vec2(r.x); // Ellipse semi-axes matching rounded rect
  vec2 normalizedP = p / ellipseB;
  float t = atan(normalizedP.y, normalizedP.x) / (2.0 * 3.14159265) + 0.5;
  
  return vec2(d, t);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
  return mix(a, b, h) - k*h*(1.0-h);
}

half4 main(float2 p) {
  float circleRadius = r * (1.0 - smoothstep(0.8, 1.0, progress));
  vec2 sdf1 = sdCircle(p + vec2(0, -r), c1, circleRadius);
  vec2 sdf2 = sdRoundedBox(p - box.xy - box.zw * 0.5, box.zw * 0.5, vec4(r));
  float k = 20 + 20 * (1.0 - abs(2.0 * progress - 1.0));
  float d = smin(sdf1.x, sdf2.x, k);
  
  // Calculate the blend factor used in smin to interpolate t
  float h = clamp(0.5 + 0.5*(sdf1.x - sdf2.x)/k, 0.0, 1.0);
  float t = mix(sdf1.y, sdf2.y, h);

  if (d > 0.0) {
     return vec4(0.0);
  }
  
  // Create gradient from yellow center to alternating red/green edge
  float patternFreq = 1.0; // Frequency of the alternating pattern
  float centerFactor = clamp(-d / r, 0.0, 1.0); // 0 at edge, 1 at center
  float edgePattern = sin(t * 2.0 * 3.14159265 * patternFreq) * 0.5 + 0.5; // Alternating pattern
  
  vec3 yellow = vec3(0.5, 0.5, 0.0);
  vec3 red = vec3(0.5, 0.0, 0.0);
  vec3 green = vec3(0.0, 0.5, 0.0);
  vec3 edgeColor = mix(red, green, edgePattern);
  
  vec3 color = mix(edgeColor, yellow, centerFactor);
  return vec4(color, 1.0);
}
`;

const r = 50;

export const DisplacementMap1 = () => {
  const oslo = useImage(require("../../assets/oslo.jpg"));
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  const { progress, c1, box, bounds } = useButtonGroup({ width, height }, r);
  const uniforms = useDerivedValue(() => {
    return {
      progress: progress.value,
      c1: c1.value,
      box: box,
      boxRadius: r,
      r,
    };
  });
  const gesture = Gesture.Tap().onEnd(() => {
    progress.value = withSpring(progress.value === 0 ? 1 : 0);
  });
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas
          style={{ flex: 1 }}
          onLayout={({ nativeEvent: { layout } }) => {
            setSize({
              width: layout.width,
              height: layout.height,
            });
          }}
        >
          <Fill color="white" />
          <Group clip={rect(0, height / 2, width, height / 2)}>
            <Fill color="black" />
          </Group>
          <Image image={oslo} rect={rect(0, 0, width, height)} fit="cover" />
          <BackdropFilter
            filter={
              <DisplacementMap channelX="r" channelY="g" scale={20}>
                <Shader
                  source={source}
                  uniforms={uniforms}
                  transform={[
                    { translateX: bounds.x },
                    { translateY: bounds.y },
                  ]}
                />
              </DisplacementMap>
            }
          />
          <Group>
            <Fill>
              <Shader
                source={source}
                uniforms={uniforms}
                transform={[{ translateX: bounds.x }, { translateY: bounds.y }]}
              />
            </Fill>
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );
};
