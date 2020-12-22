// start of fragment shader
#define numSphere 10
#define maxDepth 6
precision highp float;
uniform vec3 eyePos;
varying vec3 initialRay;

uniform float textureWeight;
uniform sampler2D texture;

uniform float val1;
uniform float val2;
uniform float val3;
uniform float val4;
uniform float val5;

//light position
uniform vec3 lightPos;
uniform float lightSize;
uniform float timeSinceStart;
const float pi = 3.1415926535897932384626433836795028841971;
const float inf = 1000000000000000.0;
const float epsilon = 0.00001; 

vec3 saturate(vec3 a) { return clamp(a, 0.0, 1.0); }
vec2 saturate(vec2 a) { return clamp(a, 0.0, 1.0); }
float saturate(float a) { return clamp(a, 0.0, 1.0); }

float Hash1d(float u)
{
    return fract(sin(u)*143.9);	// scale this down to kill the jitters
}
float Hash2d(vec2 uv)
{
    float f = uv.x + uv.y * 37.0;
    return fract(sin(f)*104003.9);
}
float Hash3d(vec3 uv)
{
    float f = uv.x + uv.y * 37.0 + uv.z * 521.0;
    return fract(sin(f)*110003.9);
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

float random(vec3 scale, float seed){return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 4347438.38745 + seed);}

//return random point on the surface of a unit sphere
vec3 randomUnitDirection(float seed){
  float u = random(vec3(2.211,7.5334,2.3534), seed);
  float v = random(vec3(4.4731,2.5994,4.321   ), seed);
  float theta = pi * 2.0 * u;
  float phi = pi * (v - 0.5);
  return vec3(cos(phi)*cos(theta), cos(phi)*sin(theta), sin(phi));
}

// return a random direction whose probability distribution is propotional to dot(x, normal); 
// normal should have length 1
vec3 cosineWeightedDirection(float seed, vec3 normal){
  return normalize(normal + randomUnitDirection(seed));
}

float SDSphere(vec3 pos, float radius){
  return(length(pos - vec3(0.0,0.0,0.0))-radius);
}

float SDRectangle(vec3 pos, vec3 size, float r){
  vec3 q = abs(pos - vec3(0.0,0.0,0.0))- size; 
  return length(max(q,0.0)) + min((max(q.x,max(q.y,q.z))),0.0) -r;
}

float SDTorus(vec3 pos, float r1, float r2){
  vec2 q = vec2(length(pos.xy)-r1,pos.z);
  vec3 p = 2.0 * vec3(normalize(pos.xy),0.0);
  return length(q)-r2;
}

float DistanceToObject(vec3 pos){
  vec3 repeat = fract(pos) - 0.5;
  return SDTorus(rotate(repeat,vec3(0.5,0.5,0.5),timeSinceStart/10.0),0.3,0.05);
}


vec3 findBackGround(vec3 origin, vec3 dir){
  return mix(vec3(1.0,1.0,1.0),vec3(0.5,0.7,1.0),(dir.y+1.0)*0.5);
}


//find pixel color iteratively
vec3 findColor(vec3  origin,vec3 dir ){
  float maxD = 45.0;
  vec2 uv = ((gl_FragCoord.xy/vec2(1000.0,700.0)) - 0.5) * 2.0;
  // ----------------------------- Ray march the scene ------------------------------
	float dist = 1.0;
	float t = 0.1;
  //float t = 0.1 + Hash2d(uv)*0.1;	// random dither-fade things close to the camera
   // farthest distance rays will travel
	vec3 pos;
  float smallVal = 0.000625;
	// ray marching time
    for (int i = 0; i < 210; i++)	// This is the count of the max times the ray actually marches.
    {
        // Step along the ray. Switch x, y, and z because I messed up the orientation.
        pos = (origin + dir * t).xyz;
        // This is _the_ function that defines the "distance field".
        // It's really what makes the scene geometry. The idea is that the
        // distance field returns the distance to the closest object, and then
        // we know we are safe to "march" along the ray by that much distance
        // without hitting anything. We repeat this until we get really close
        // and then break because we have effectively hit the object.
        dist = DistanceToObject(pos);
        // This makes the ray trace more precisely in the center so it will not miss the
        // vertical glowy beam.
        //dist = min(dist, length(pos.yz));

        t += dist;
        // If we are very close to the object, let's call it a hit and exit this loop.
        if ((t > maxD) || (abs(dist) < smallVal)) break;
    }

    vec3 smallVec = vec3(smallVal, 0, 0);
    vec3 normalU = vec3(dist - DistanceToObject(pos - smallVec.xyy),
                       dist - DistanceToObject(pos - smallVec.yxy),
                       dist - DistanceToObject(pos - smallVec.yyx));
    vec3 normal = normalize(normalU);

    // calculate 2 ambient occlusion values. One for global stuff and one
    // for local stuff
    float ambientS = 1.0;
    ambientS *= saturate(DistanceToObject(pos + normal * 0.05)*20.0);
    ambientS *= saturate(DistanceToObject(pos + normal * 0.1)*10.0);
    ambientS *= saturate(DistanceToObject(pos + normal * 0.2)*5.0);
    ambientS *= saturate(DistanceToObject(pos + normal * 0.4)*2.5);
    ambientS *= saturate(DistanceToObject(pos + normal * 0.8)*1.25);
    float ambient = ambientS * saturate(DistanceToObject(pos + normal * 1.6)*1.25*0.5);
    ambient = saturate(ambient);
    float ambientAvg = (ambient*3.0 + ambientS) * 0.25;
    //diffuse
    vec3 sunDir = normalize(vec3(9.93, 9.0, 19.5));
    float diffuse = dot(sunDir, normal);
    vec3 lightColor = vec3(0.6)* vec3(diffuse);
    // a red and blue light coming from different directions
    lightColor += (vec3(1.0, 0.2, 0.4) * saturate(normal.x *0.5+0.5))*pow(ambientAvg, 0.35);
    lightColor += (vec3(0.1, 0.5, 0.99) * saturate(-normal.y *0.5+0.5))*pow(ambientAvg, 0.35);
    // blue glow light coming from the glow in the middle
    //lightColor += vec3(0.3, 0.5, 0.9) * saturate(dot(-pos, normal))*pow(ambientS, 0.3);
    if(t<45.0)
      return lightColor;
    else
      return findBackGround(origin,dir);
}

void main(){

  
  vec3 initialRayBlur = initialRay + 0.001 * randomUnitDirection(timeSinceStart); 
  vec3 textureData = texture2D(texture, gl_FragCoord.xy / vec2(1000,700)).rgb;
  gl_FragColor = vec4(mix(findColor(eyePos, initialRayBlur), textureData, textureWeight), 1.0);
}
