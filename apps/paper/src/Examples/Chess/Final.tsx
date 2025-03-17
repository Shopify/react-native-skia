import React from "react";
import { Canvas, Fill, Shader } from "@shopify/react-native-skia";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useDerivedValue,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";

import { frag, glsl } from "../../components/ShaderLib";

const { width, height } = Dimensions.get("window");

const sf = 300;

const lib = glsl`

const float PI = ${Math.PI};
const float EPS = 0.01;
const float FAR = 1000.;
const int I_MAX = 1024;

// ~~~~~~~~ CAMERA ~~~~~~~~
mat3 rot(vec2 angle)
{
    vec2 cc = cos(angle);
    vec2 ss = sin(angle);
    return mat3(vec3(cc.x      , 0.  , ss.x      ),
				vec3(ss.x*ss.y , cc.y, -ss.y*cc.x),
                vec3(-cc.y*ss.x, ss.y, cc.x*cc.y ));
}

// ~~~~~~~~ SDFs and operations ~~~~~~~~
// SDFs from iq's website https://iquilezles.org/articles/distfunctions
float sdSphere(vec3 o, float r, vec3 p)
{
    return length(p - o) - r;
}

float sdBox(vec3 b, vec3 p)
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdRoundedBox(vec3 b, float r, vec3 p)
{
	return sdBox(b, p) - r;
}

float sdHPlane(float h, vec3 p)
{
    return p.y - h;
}

float sdCappedCylinder(float h, float r, vec3 p)
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdEllipsoid(vec3 r, vec3 p)
{
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

float sdTorus(vec2 t, vec3 p)
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdRoundCone(vec3 a, vec3 b, float r1, float r2, vec3 p)
{
    vec3  ba = b - a;
    float l2 = dot(ba,ba);
    float rr = r1 - r2;
    float a2 = l2 - rr*rr;
    float il2 = 1.0/l2;
    
    vec3 pa = p - a;
    float y = dot(pa,ba);
    float z = y - l2;
    vec3 x =  pa*l2 - ba*y;
    float x2 = dot(x, x);
    float y2 = y*y*l2;
    float z2 = z*z*l2;

    float k = sign(rr)*rr*rr*x2;
    if( sign(z)*a2*z2 > k ) return  sqrt(x2 + z2)        *il2 - r2;
    if( sign(y)*a2*y2 < k ) return  sqrt(x2 + y2)        *il2 - r1;
                            return (sqrt(x2*a2*il2)+y*rr)*il2 - r1;
}

float sdCone(vec2 c, float h, vec3 p)
{
  float q = length(p.xz);
  return max(dot(c.xy,vec2(q,p.y)),-h-p.y);
}

float smin(float a, float b, float k)
{
    float h = max( k-abs(a-b), 0.0 )/k;
    return min( a, b ) - h*h*k*(1.0/4.0);
}

float smax(float a, float b, float k)
{
    k *= 1.4;
    float h = max(k-abs(a-b),0.0);
    return max(a, b) + h*h*h/(6.0*k*k);
}

// ~~~~~~~~ Ray-marching algorithm ~~~~~~~~
struct RMResult{
  	float dist;
    float id;
};

RMResult map(vec3 p)
{
    float d = FAR;
    float id = -1.;
    
    {// board
        float d0 = sdRoundedBox(vec3(8.2, 0.35, 8.2), 0.1, p - vec3(0., -1.5, 0.));
        if (d0 < d)
        {
            d = d0;
            id = 0.5;
        }
    }
    {// queen
		p += vec3(1., 0., 1.);
        // body
        vec3 p0 = p - vec3(0., 0.5, 0.);
        float r = 0.28 + pow(0.4 - p0.y, 2.) / 6.;
        float d0 = sdCappedCylinder(1.5, r, p0) - 0.02;
        // head
        vec3 p1 = p - vec3(0., 1.9, 0.);
        float d1 = sdCappedCylinder(0.2, r - 0.1, p1);
        d0 = smax(d0, -d1, 0.03);
        vec3 p2 = p  - vec3(0., 2.05, 0.);
        float a = mod(atan(p2.z, p2.x) + PI / 8., PI / 4.) - PI / 8.;
        float l = length(vec2(p2.x, p2.z));
        p2 = vec3(p2.y, l * cos(a), l * sin(a));
        float d2 = sdCappedCylinder(0.6, 0.12, p2);
        d0 = smax(d0, -d2, 0.07);
        vec3 p3 = p - vec3(0., 2.15, 0.);
        float d3 = sdCone(vec2(sin(PI / 5.), cos(PI / 5.)), 0.22, p3);
         d0 = smin(d0, d3, 0.05);
        float d4 = sdSphere(vec3(0., 2.18, 0.), 0.09, p);
         d0 = smin(d0, d4, 0.03);
        vec3 p5 = p - vec3(0., 1.4, 0.);
        float d5 = sdEllipsoid(vec3(0.5, 0.07, 0.5), p5);
        d0 = smin(d0, d5, 0.03);
        vec3 p6 = p - vec3(0., 1.51, 0.);
        float d6 = sdEllipsoid(vec3(0.42, 0.07, 0.42), p6);
       d0 = smin(d0, d6, 0.03);
        // base
        vec3 p7 = p - vec3(0., -1., 0.);
        float d7 = sdTorus(vec2(0.43, 0.5), p7);
        d7 = max(d7, -sdHPlane(0., p7));
         d0 = smin(d0, d7, 0.05);
        float d8 = sdEllipsoid(vec3(0.77, 0.08, 0.77), p - vec3(0., -0.55, 0.));
        d0 = smin(d0, d8, 0.05);
        // stripes
        float d9 = sdTorus(vec2(0.586, 0.01), p - vec3(0., -0.425, 0.));
        d0 = smax(d0, -d9, 0.05);
        float d10 = sdTorus(vec2(0.553, 0.01), p - vec3(0., -0.345, 0.));
         d0 = smax(d0, -d10, 0.05);
        if (d0 < d)
        {
            d = d0;
            id = 1.5;
        }
    }
    
    return RMResult(d, id);
}

vec3 gradient( vec3 p )
{
    float h = EPS * EPS;
    vec2 k = vec2(1,-1);
    return normalize( k.xyy * map(p + k.xyy * h).dist + 
                      k.yyx * map(p + k.yyx * h).dist + 
                      k.yxy * map(p + k.yxy * h).dist + 
                      k.xxx * map(p + k.xxx * h).dist );
}

RMResult raymarch(vec3 ro, vec3 rd, out float t)
{
	t = 0.;
    vec3 p = ro + t * rd;
    RMResult s = map(p);
    float isInside = sign(s.dist);
    for(int i = 0; i < I_MAX; i++)
    {
        float inc = isInside * s.dist;
        if (t + inc < FAR && abs(s.dist) > EPS) 
        {
			t += inc;
	        p = ro + t * rd;
            s = map(p);
        }
        else
        {
            if (t + inc > FAR)
            {
               s.id = -1.;
            }
            break;
        }
    }
    return s;
}
`;

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
