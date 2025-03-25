import { glsl } from "../../components/ShaderLib";

export const lib = glsl`

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
    {
        // queen
		//p += vec3(1., 0., 1.);
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
