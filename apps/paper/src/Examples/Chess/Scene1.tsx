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

const { width, height } = Dimensions.get("window");

const sf = 300;

const rt = frag`
uniform vec3 cameraPosition;

const vec2 size = vec2(${width}, ${height}-250.0);
const vec3 backgroundColor = vec3(0.3, 0.6, 1.0);

const vec3 cameraLookAt = vec3(0.0, 0.0, 0.0);
const float cameraRoll = 0.0;
const float light2Intensity = 1.0;
const float lineProgress = 2.0;
const float startRadius = 0.2;
const float coneTo = 2.5;

const float PI = 3.141592653589793;

// Material properties for PBR lighting
struct Material {
    vec3 color;
    float roughness;
    float metalness;
    float reflectivity;
};

struct Hit {
    float dist;
    int materialId;
    Material material;
};

struct Light {
    vec3 position;
    vec3 color;
    float intensity;
    bool isSun; // directional if true, point light if false
};


Hit minWithMaterial(Hit a, Hit b) {
   if (a.dist < b.dist) {
     return a;
   } else {
     return b;
   }
}

const int NUM_LIGHTS = 2;
Light lights[NUM_LIGHTS];

void setupLights() {
    // Main directional light (sun)
    lights[0].position = normalize(vec3(1.0, 2.0, 1.0));
    lights[0].color = vec3(1.0, 1.0, 1.0);
    lights[0].intensity = 1.0;
    lights[0].isSun = true;
    
    // Fill light (point light)
    lights[1].position = vec3(3.0, 3.0, 3.0);
    lights[1].color = vec3(1.0, 1.0, 1.0);
    lights[1].intensity = light2Intensity;
    lights[1].isSun = false;
    // lights[1].position = vec3(2.0, 3.0, 4.0);
    // lights[1].color = vec3(0.3, 0.6, 1.0);
    // lights[1].intensity = 0.3;
    // lights[1].isSun = false;
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

float sdfCone( vec3 p, vec2 c, float h )
{
  // c is the sin/cos of the angle, h is height
  // Alternatively pass q instead of (c,h),
  // which is the point at the base in 2D
  vec2 q = h*vec2(c.x/c.y,-1.0);
    
  vec2 w = vec2( length(p.xz), p.y );
  vec2 a = w - q*clamp( dot(w,q)/dot(q,q), 0.0, 1.0 );
  vec2 b = w - q*vec2( clamp( w.x/q.x, 0.0, 1.0 ), 1.0 );
  float k = sign( q.y );
  float d = min(dot( a, a ),dot(b, b));
  float s = max( k*(w.x*q.y-w.y*q.x),k*(w.y-q.y)  );
  return sqrt(d)*sign(s);
}


float sdEllipsoid(vec3 r, vec3 p)
{
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

float sdCappedCylinder(float h, float r, vec3 p)
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdSphere(vec3 o, float r, vec3 p)
{
    return length(p - o) - r;
}

float roundBoxSDF( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b + r;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sphereSDF(float3 p, float radius) {
  return length(p) - radius;
}

float boxSDF(float3 p, float3 b) {
  float3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float cylinderSDF( vec3 p, vec3 a, vec3 b, float r)
{
  vec3  ba = b - a;
  vec3  pa = p - a;
  float baba = dot(ba,ba);
  float paba = dot(pa,ba);
  float x = length(pa*baba-ba*paba) - r*baba;
  float y = abs(paba-baba*0.5)-baba*0.5;
  float x2 = x*x;
  float y2 = y*y*baba;
  float d = (max(x,y)<0.0)?-min(x2,y2):(((x>0.0)?x2:0.0)+((y>0.0)?y2:0.0));
  return sign(d)*sqrt(abs(d))/baba;
}

float cylinder2SDF( vec3 p, float h, float r )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float lineSDF( vec3 p, vec3 a, vec3 b, float r )
{
  vec3 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}

float dot2( in vec3 v ) { return dot(v,v); }

float roundConeSDF( vec3 p, vec3 a, vec3 b, float r1, float r2)
{
    // sampling independent computations (only depend on shape)
    vec3  ba = b - a;
    float l2 = dot(ba,ba);
    float rr = r1 - r2;
    float a2 = l2 - rr*rr;
    float il2 = 1.0/l2;
      
    // sampling dependant computations
    vec3 pa = p - a;
    float y = dot(pa,ba);
    float z = y - l2;
    float x2 = dot2( pa*l2 - ba*y );
    float y2 = y*y*l2;
    float z2 = z*z*l2;
  
    // single square root!
    float k = sign(rr)*rr*rr*x2;

    if( sign(z)*a2*z2>k ) {
      return   sqrt(x2 + z2)        *il2 - r2;
    } else  if( sign(y)*a2*y2<k ) {
      return   sqrt(x2 + y2)        *il2 - r1; 
    } else {
      return  (sqrt(x2*a2*il2)+y*rr)*il2 - r1;
    }
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



vec3 transform(vec3 p, mat4 m) {
  vec4 homogeneous = m * vec4(p, 1.0);
  return homogeneous.xyz / homogeneous.w;
}

Material createMaterial(vec3 color, float roughness, float metalness, float reflectivity) {
    Material mat;
    mat.color = color;
    mat.roughness = roughness;
    mat.metalness = metalness;
    mat.reflectivity = reflectivity;
    return mat;
}


Hit sceneSDF(float3 p) {
    // Define your scene here
    Hit obj0;
           vec3 pobj0 = transform(p, mat4(1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,1));
           obj0.dist = roundBoxSDF(pobj0, vec3(4,0.1,4), float(0.1));
          obj0.material = createMaterial(vec3(0.1725490242242813,0.24313725531101227,0.3137255012989044), float(0.8), float(0.5), float(0.5));
Hit obj1;
           vec3 pobj1 = p;
           obj1.dist = lineSDF(pobj1, vec3(0,0,0), vec3(0, lineProgress, 0), float(0.1));
          obj1.material = createMaterial(vec3(0.9058823585510254,0.2980392277240753,0.23529411852359772), float(0.8), float(0.5), float(0.5));
Hit obj2;
           vec3 pobj2 = p;
           obj2.dist = roundConeSDF(pobj2, vec3(0, lineProgress, 0), vec3(0, coneTo, 0), startRadius, float(0.1));
          obj2.material = createMaterial(vec3(0.9058823585510254,0.2980392277240753,0.23529411852359772), float(0.8), float(0.5), float(0.5));
Hit obj3;
           vec3 pobj3 = p;
           obj3.dist = lineSDF(pobj3, vec3(0,0,0), vec3(0, 0, lineProgress), float(0.1));
          obj3.material = createMaterial(vec3(0.18039216101169586,0.800000011920929,0.4431372582912445), float(0.8), float(0.5), float(0.5));
Hit obj4;
           vec3 pobj4 = p;
           obj4.dist = roundConeSDF(pobj4, vec3(0, 0, lineProgress), vec3(0, 0, coneTo), startRadius, float(0.1));
          obj4.material = createMaterial(vec3(0.18039216101169586,0.800000011920929,0.4431372582912445), float(0.8), float(0.5), float(0.5));
Hit obj5;
           vec3 pobj5 = p;
           obj5.dist = lineSDF(pobj5, vec3(0,0,0), vec3(lineProgress, 0, 0), float(0.1));
          obj5.material = createMaterial(vec3(0.16078431904315948,0.501960813999176,0.7254902124404907), float(0.8), float(0.5), float(0.5));
Hit obj6;
           vec3 pobj6 = p;
           obj6.dist = roundConeSDF(pobj6, vec3(lineProgress, 0, 0), vec3(coneTo, 0, 0), startRadius, float(0.1));
          obj6.material = createMaterial(vec3(0.16078431904315948,0.501960813999176,0.7254902124404907), float(0.8), float(0.5), float(0.5));

    Hit result = minWithMaterial(obj6, minWithMaterial(obj5, minWithMaterial(obj4, minWithMaterial(obj3, minWithMaterial(obj2, minWithMaterial(obj1, obj0))))));
    
    return result;
}

float3 getNormal(float3 p) {
    const float h = 0.0001;
    const float2 k = float2(1.0, -1.0);
    return normalize(k.xyy*sceneSDF(p + k.xyy*h).dist + 
                    k.yyx*sceneSDF(p + k.yyx*h).dist + 
                    k.yxy*sceneSDF(p + k.yxy*h).dist + 
                    k.xxx*sceneSDF(p + k.xxx*h).dist);
}

Hit raymarch(float3 ro, float3 rd) {
    float t = 0.0;
    Hit hit;
    
    for(int i = 0; i < 512; i++) {
        float3 p = ro + rd * t;
        hit = sceneSDF(p);
        if(hit.dist < 0.0001 || t > 100.0) {
          break;
        }
        t += hit.dist;
    }
    
    hit.dist = t;
    return hit;
}


// Calculate shadows using ray marching
float calcShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    
    for(int i = 0; i < 32; i++) {
        float h = sceneSDF(ro + rd * t).dist;
        if(h < 0.001) return 0.0;
        
        res = min(res, k * h / t);
        t += clamp(h, 0.01, 0.2);
        
        if(t > maxt) break;
    }
    
    return clamp(res, 0.0, 1.0);
}

float calcAO(vec3 pos, vec3 nor) {
    float occ = 0.0;
    float sca = 1.0;
    
    for(int i = 0; i < 5; i++) {
        float h = 0.01 + 0.12 * float(i) / 4.0;
        float d = sceneSDF(pos + h * nor).dist;
        occ += (h - d) * sca;
        sca *= 0.95;
    }
    
    return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

// Lighting function to calculate illumination for a point
vec3 calculateLighting(vec3 point, vec3 normal, vec3 baseColor, int materialType) {
    // Light settings
    vec3 ambientColor = vec3(0.1, 0.1, 0.1);
    vec3 diffuseColor = vec3(0.7, 0.7, 0.7);
    vec3 lightPosition = cameraPosition; // Position of the point light
    float lightIntensity = 1;
    
    // Ambient component
    vec3 ambient = ambientColor * baseColor;
    
    // Diffuse lighting (directional light from above)
    vec3 lightDir = normalize(vec3(0.0, 5.0, 0.0));
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor * baseColor;
    
    // Point light calculation
    vec3 pointLightDir = normalize(lightPosition - point);
    float pointDiff = max(dot(normal, pointLightDir), 0.0);
    
    // Attenuation (light gets weaker with distance)
    float distance = length(lightPosition - point);
    float attenuation = 1.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);
    
    vec3 pointLight = pointDiff * lightIntensity * attenuation * baseColor;
    
    // Combine all lighting components
    return ambient + diffuse + pointLight;
}

vec3 stylizedTonemapOld(vec3 color) {
    // Increase exposure significantly for brighter colors
    color *= 4.0;  // Higher exposure boost for vibrant look
    
    // Apply a more aggressive tone mapping curve for vibrant colors
    // Using modified Reinhard operator with higher white point
    float whitePoint = 4.0;
    color = (color * (1.0 + color/(whitePoint*whitePoint))) / (1.0 + color);
    
    // Enhance saturation significantly
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luminance), color, 1.8);  // Boost saturation more aggressively
    
    // Apply a more pronounced contrast S-curve
    color = color * color * (3.0 - 2.0 * color);
    
    // Add a slight color bias toward warmer tones (optional)
    color.r *= 1.05;
    color.g *= 1.02;
    
    return clamp(color, 0.0, 1.0);
}

vec3 stylizedTonemap(vec3 color) {
    // Moderate exposure boost for balanced brightness
    color *= 5.2;  // Slightly reduced exposure for better balance
    
    // Use a more extreme tone mapping curve
    // Modified Reinhard with slightly reduced white point for controlled highlights
    float whitePoint = 6.5;
    color = (color * (1.0 + color/(whitePoint*whitePoint))) / (1.0 + color);
    
    // Apply color correction before saturation boost
    // This helps prevent oversaturation of already bright areas
    color = pow(color, vec3(0.85));  // Gamma adjustment for brighter midtones
    
    // Enhance saturation significantly
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luminance), color, 1.9);  // More controlled saturation boost
    
    // Apply a more aggressive contrast S-curve for punchier look
    color = color * color * (3.0 - 1.7 * color);  // Modified to prevent too much darkening
    
    // Remove color bias for neutral black and white rendering
    // If you still want some vibrancy in colored objects but neutral blacks/whites,
    // you could use a selective approach instead
    
    return clamp(color, 0.0, 1.0);
}

// PBR lighting calculation
vec3 pbr(vec3 p, vec3 n, vec3 v, Material mat) {
    setupLights();
    
    // Material properties
    vec3 albedo = mat.color;
    float roughness = mat.roughness;
    float metalness = mat.metalness;
    
    // Constants for PBR
    const float PI = 3.14159265359;
    
    // Base reflectivity for dielectrics (non-metals)
    vec3 F0 = mix(vec3(0.04), albedo, metalness);
    
    // Calculate ambient occlusion
    float ao = calcAO(p, n);
    
    // Initialize the accumulator for direct lighting
    vec3 Lo = vec3(0.0);
    
    // Calculate lighting contribution from each light
    for(int i = 0; i < NUM_LIGHTS; i++) {
        vec3 L;
        float attenuation = 1.0;
        
        if(lights[i].isSun) {
            // Directional light
            // Directional light
            L = normalize(lights[i].position);
            
            // Simple shadow calculation for directional light
            float shadow = calcShadow(p, L, 0.1, 20.0, 16.0);
            attenuation *= shadow;
        } else {
            // Point light
            vec3 lightVec = lights[i].position - p;
            float distance = length(lightVec);
            L = normalize(lightVec);
            
            // Attenuation based on distance
            attenuation = 1.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);
            
            // Point light shadows
            float shadow = calcShadow(p, L, 0.1, distance, 16.0);
            attenuation *= shadow;
        }
        
        // Half vector between view and light directions
        vec3 H = normalize(v + L);
        
        // Calculate dot products for lighting equation
        float NdotL = max(dot(n, L), 0.0);
        float NdotV = max(dot(n, v), 0.0);
        float NdotH = max(dot(n, H), 0.0);
        float HdotV = max(dot(H, v), 0.0);
        
        if(NdotL > 0.0) {
            // Diffuse term (Lambert)
            vec3 diffuse = albedo / PI;
            
            // Specular term (simplified GGX)
            float alpha = roughness * roughness;
            float alpha2 = alpha * alpha;
            
            // Normal Distribution Function (D)
            float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
            float D = alpha2 / (PI * denom * denom);
            
            // Fresnel term (F) - Schlick approximation
            vec3 F = F0 + (1.0 - F0) * pow(1.0 - HdotV, 5.0);
            
            // Geometry term (G) - simplified
            float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
            float G = NdotL * NdotV / ((NdotL * (1.0 - k) + k) * (NdotV * (1.0 - k) + k));
            
            // Combine terms for specular
            vec3 specular = D * F * G / (4.0 * NdotV * NdotL + 0.001);
            //specular *= 0.6; // Reduce specular intensity to 60%
            
            // Energy conservation: metallic surfaces don't have diffuse
            vec3 kD = (1.0 - F) * (1.0 - metalness);
            
            // Combine diffuse and specular
            Lo += (kD * diffuse + specular) * lights[i].color * lights[i].intensity * NdotL * attenuation;
        }
    }
    
    // Ambient lighting (simplified IBL)
    vec3 ambient = vec3(0.03) * albedo * ao;
    
    // Final color
    vec3 color = ambient + Lo;
    
    // HDR tonemapping and gamma correction
    //color = color / (color + vec3(1.0));
    //color = color / (color + vec3(0.7));  // Adjusted exposure for brighter look
    color = stylizedTonemap(color);

    return color;
}


float3 render(float3 ro, float3 rd) {
    float3 col = backgroundColor;
    Hit hit = raymarch(ro, rd);
    
    // If we hit something
    if(hit.dist < 100.0) {
        vec3 p = ro + rd * hit.dist;
        vec3 n = getNormal(p);
        
        // View direction (from point to camera)
        vec3 v = normalize(ro - p);
        
        // Apply PBR lighting
        col = pbr(p, n, v, hit.material);
    }
    
    return col;
}


vec4 main(float2 fragCoord) {
    // Anti-aliasing settings
    const int samples = 1; // Used when aaSamples uniform isn't provided
 
    float sampleStrength = 1.0/float(samples*samples);
    float3 finalColor = float3(0.0);
    
    // Perform supersampling
    for(int m = 0; m < samples; m++) {
        for(int n = 0; n < samples; n++) {
            // Calculate offset for this sample (only if using AA)
            vec2 offset = (samples > 1) ? 
                (vec2(float(m), float(n)) / float(samples) - 0.5/float(samples)) : 
                vec2(0.0);
            
            // Get UV coordinates with the offset
            float2 uv = ((fragCoord + offset) - 0.5 * size.xy) / size.x;
            uv.y = -uv.y;  // Flip Y coordinate to match Skia's coordinate system
            
            // Camera setup
            float3 ro = cameraPosition;
            float3 ta = cameraLookAt;
            float cr = cameraRoll;

            // Camera matrix
            float3 ww = normalize(ta - ro);
            float3 cp = float3(sin(cameraRoll), cos(cameraRoll), 0.0);
            float3 uu = normalize(cross(ww, cp));
            float3 vv = normalize(cross(uu, ww));
            
            float3 rd = normalize(uv.x * uu + uv.y * vv + 1.5 * ww);
            
            // Render this sample
            float3 col = render(ro, rd);
            
            // Accumulate color
            finalColor += col * sampleStrength;
        }
    }
    
    // Final gamma correction
    finalColor = pow(finalColor, vec3(0.4545));
    return vec4(finalColor, 1.0);
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
    const dist = 7;
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
