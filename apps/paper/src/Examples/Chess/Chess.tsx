import React from "react";
import { Canvas, Fill, Shader } from "@shopify/react-native-skia";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useDerivedValue,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";

import { frag } from "../../components/ShaderLib";

import { lib } from "./Shader";

const { width, height } = Dimensions.get("window");
const sf = 100;

const rt = frag`
// SkSL version of the ShaderToy shader
// Original shader converted for Skia use

uniform vec3 cameraPosition;
const float2 iResolution = vec2(${width}, ${height});  // Canvas size
const float iTime = 0.;         // Current time in seconds
const float4 iMouse = vec4(0.);       // Mouse position

// Shadertoy conversion macros
const float2 R = iResolution.xy;
const float FOCAL = 2.0;

// Lighting parameters
const float AMBIENT_INTENSITY = 0.2;
const float DIFFUSE_INTENSITY = 0.8;
const float BACKLIGHT_INTENSITY = 0.1;
const float BOUNCE_LIGHT_INTENSITY = 0.1;

// Light sources
float3 mainLightDir = normalize(float3(1.0, 0.0, 0.0));
float3 mainLightColor = float3(1.0, 1.0, 1.0);
float3 skyLightDir = float3(0.0, 1.0, 0.0);
float3 skyLightColor = float3(0.7, 0.43, 0.3);
float3 backLightDir = normalize(float3(-1.0, 0.0, 0.0));
float3 backLightColor = float3(1.0, 1.0, 1.0);
float3 ambientColor = float3(1.0, 1.0, 1.0);

// Material definitions
float3 boardDarkColor = float3(0.05, 0.05, 0.05);
float3 boardLightColor = float3(0.9, 0.9, 0.9);
float3 boardEdgeColor = float3(0.5215686559677124, 0.3294117748737335, 0.2235294133424759);
float3 pieceColor = float3(0.95, 0.95, 0.85);
float3 skyColor = float3(0.3, 0.6, 1.0);

${lib}

// Lighting function to calculate illumination for a point
float3 calculateLighting(float3 normal, float3 baseColor, int materialType) {
    float3 color = float3(0.0, 0.0, 0.0);
    
    // Ambient lighting component (constant ambient light)
    color += ambientColor * baseColor * AMBIENT_INTENSITY;
    
    // Diffuse lighting from main light
    float diffuse = max(0.0, dot(normal, mainLightDir));
    color += mainLightColor * baseColor * diffuse * DIFFUSE_INTENSITY;
    
    // Add material-specific lighting
    if (materialType == 2) { // Chess piece
        // Back lighting (rim light effect)
        float backLight = max(0.0, dot(normal, backLightDir));
        color += backLightColor * baseColor * backLight * BACKLIGHT_INTENSITY;
        
        // Bounce light from below (to simulate light bouncing off the board)
        float bounceLight = max(0.0, dot(normal, skyLightDir));
        color += skyLightColor * baseColor * bounceLight * BOUNCE_LIGHT_INTENSITY;
    }
    
    return color;
}

// SkSL main function (equivalent to ShaderToy's mainImage)
half4 main(float2 fragCoord) {
    float2 uv = (2.0 * fragCoord - R.xy) / R.y;
    uv.y = -uv.y;  // Flip Y coordinate to match Skia's coordinate system
    float2 angle = float2(2.0 * iMouse.xy / R.xy - 1.0) * float2(3.0, -0.7);
    angle.x += iTime;
    
    // float3x3 rotCam = rot(angle);
    // float3 ro = rotCam * float3(0.0, 0.0, 4.5);
    // ro += float3(-1.0, 0.4, -1.0);
    // float3 rd = rotCam * normalize(float3(uv, -FOCAL));

    float3 ro = cameraPosition;
    float3 ta = vec3(0.);
    float cr = 0.;
    // Camera matrix
    float3 ww = normalize(ta - ro);
    float3 cp = float3(sin(cr), cos(cr), 0.0);
    float3 uu = normalize(cross(ww, cp));
    float3 vv = normalize(cross(uu, ww));
    float3 rd = normalize(uv.x * uu + uv.y * vv + 1.5 * ww);
    
    float t;
    RMResult s = raymarch(ro, rd, t);
    float3 p = ro + t * rd;
    float3 normal = gradient(p);
    float3 col;
    
    // Determine material and apply lighting
    if (s.id < 0.0) {
        // Skybox - no lighting calculation needed
        col = skyColor;
    }
    else if (s.id < 1.0) {
        // Chess board
        if (abs(p.x) > 8.0 || abs(p.z) > 8.0) {
            // Board edge/frame
            float3 n = abs(normal);
            float2 fetch;
            if (n.x > n.y && n.x > n.z) {
                fetch = float2(0.5 * p.z, p.y);
            } else if (n.y > n.z) {
                fetch = float2(p.x, p.z) * 0.5;
            } else {
                fetch = float2(0.5 * p.x, p.y);
            }
            col = calculateLighting(normal, boardEdgeColor, 1);
        }
        else {
            // Chess board squares
            float2 ss = sin(0.5 * PI * p.xz);
            float3 baseColor = sign(ss.x) * sign(ss.y) < 0.0 ? boardDarkColor : boardLightColor;
            col = calculateLighting(normal, baseColor, 1);
        }
    }
    else if (s.id < 2.0) {
        // Chess piece
        col = calculateLighting(normal, pieceColor, 2);
    }
    
    // Apply gamma correction
    col = pow(col, float3(0.5, 0.5, 0.5));
    
    return half4(col.r, col.g, col.b, 1.0);
}
`;

export const Chess = () => {
  const rotateX = useSharedValue(Math.PI / 4);
  const rotateY = useSharedValue(Math.PI / 4);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      rotateY.value += event.changeX / sf;
      rotateX.value -= event.changeY / sf;
    })
    .onEnd(({ velocityX, velocityY }) => {
      rotateX.value = withDecay({ velocity: velocityY / sf });
      rotateY.value = withDecay({ velocity: velocityX / sf });
    });
  const uniforms = useDerivedValue(() => {
    const dist = 5;
    const cameraPosition = [
      dist * Math.cos(rotateX.value) * Math.cos(rotateY.value),
      dist * Math.sin(rotateX.value),
      dist * Math.cos(rotateX.value) * Math.sin(rotateY.value),
    ];
    return {
      cameraPosition,
    };
  });
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ flex: 1 }}>
          <Fill>
            <Shader source={rt} uniforms={uniforms} />
          </Fill>
        </Canvas>
      </GestureDetector>
    </View>
  );
};
