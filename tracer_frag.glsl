// start of fragment shader
#define numSphere 10
#define maxDepth 6
#define neg(s) (s<0.0)?s:0.0
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


float SDTetrahedron(vec3 pos){

  //assuming edge size = 2.0
  float halfHeight = sqrt(11.0/12.0); // the height of the tetrahedron (this is height between two opposite edges, not between vertex and edge)
  
  //vertices of the tetrahedron
  vec3 p11 = vec3(1.0,0.0,halfHeight);
  vec3 p12 = vec3(-1.0,0.0,halfHeight);
  vec3 p21 = vec3(0.0,1.0,-halfHeight);  
  vec3 p22 = vec3(0.0,-1.0,-halfHeight);
  // normal corresponding to each vertex (normal of the surface on the opposite side of the vertex )
  vec3 n11 = normalize(vec3(-0.3333,0.0,-halfHeight/3.0)- p11);
  vec3 n12 = normalize(vec3(0.3333,0.0,-halfHeight/3.0) - p12);
  vec3 n21 = normalize(vec3(0.0,-0.3333,halfHeight/3.0) - p21);
  vec3 n22 = normalize(vec3(0.0,0.3333,halfHeight/3.0) - p22);

  vec3 r1 = pos - p11;
  vec3 r2 = pos - p22;
  
  vec4 ds = vec4(dot(r1,n22),dot(r1,n21),dot(r2,n12),dot(r2,n11));// distances to each surface

  float d = 1e+9;
  float outer_dist = max(ds.x,max(ds.y,max(ds.z,max(ds.w,0.0))));
  d = min(outer_dist,d);
  
  float inner_dist = -1e9;
  for(int i=0;i<4;i++){
    if(ds[i] >= 0.0);
    else{
      if(ds[i] > inner_dist)
        inner_dist = ds[i];
    }
  }
  if(d <= 0.0 ){d = inner_dist;}
  return d;
}

float FractalTetrohedron(vec3 pos)
{
    vec3 z = pos;
    float Scale = 2.0;
    vec3 Offset = vec3(val4/20.0);
    float r;
    
    const int Iterations = 13;
    for(int n=0;n < Iterations;n++) {
       if(z.x+z.y<0.0) z.xy = -z.yx; // fold 1
       if(z.x+z.z<0.0) z.zx = -z.xz; // fold 2
       if(z.y+z.z<0.0) z.yz = -z.zy; // fold 3	
       z = z*Scale + Offset*(1.0-Scale);
    }
    return (length(z)-5.1) * pow(Scale, -float(Iterations));
}

float FractalWithRotation(vec3 pos)
{
    vec3 p = pos;
    float Scale = 2.0;
    vec3 Offset = vec3(50.0/20.0);
    
    const int Iterations = 13;
    for(int n=0;n < Iterations;n++) {
      p = rotate(p,vec3(1.,0.,1.),val4/10.0-5.0);
       if(p.x+p.y<0.0) p.xy = -p.yx; // fold 1
       if(p.x+p.z<0.0) p.zx = -p.xz; // fold 2
       if(p.y+p.z<0.0) p.yz = -p.zy; // fold 3	
       p = rotate(p,vec3(1.,1.,0.),val5/10.0-5.0);
       p = p*Scale + Offset*(1.0-Scale);
    }
    return (length(p)-5.1) * pow(Scale, -float(Iterations));
}

float DistanceToObject(vec3 pos){
  //scale  experiment 
  /*
  float unscale = 1.0; 
  vec3 repeat = fract(pos/5.0)-0.5; 
  //repeat.z = pos.z;
  unscale *= 5.0;
  float scale = val4/100.;
  vec3 p = scale * repeat + vec3(0.,0.,0.)*(1.-scale);
  unscale /= scale;
  //p = p + vec3(0.,0.,1.0);
  p = rotate(p,vec3(1.0,0.0,0.0),val1/10.0-5.0);
  p = rotate(p,vec3(.0,1.0,0.0),val2/10.0-5.0 );
  p = rotate(p,vec3(.0,0.0,1.0),val3/10.0-5.0 );

  return unscale * SDTorus(p,0.2,0.01);
  */



  //example using intersection and complement 
  /*
  float scale = 4.0;
  float d = SDTetrahedron(scale * p)/scale;
  vec3 p_flip = vec3(p.xy,-p.z);
  float d_flip = SDTetrahedron(scale* p_flip) / scale;
  scale = scale / 2.0;
  return max(d,-d_flip);
  */

  
  vec3 p = pos + vec3(0.,0.,0.0);
  p = rotate(p,vec3(1.0,0.0,0.0),val1/10.0-5.0);
  p = rotate(p,vec3(.0,1.0,0.0),val2/10.0-5.0 );
  p = rotate(p,vec3(.0,0.0,1.0),val3/10.0-5.0 );
  return FractalWithRotation(p);
}



vec3 findBackGround(vec3 origin, vec3 dir){
  return 0.0*mix(vec3(1.0,1.0,1.0),vec3(0.5,0.7,1.0),(dir.y+1.0)*0.5);
}


//find pixel color iteratively
vec3 findColor(vec3  origin,vec3 dir ){
  // farthest distance rays will travel
  float maxD = 50.0;
  vec2 uv = ((gl_FragCoord.xy/vec2(1000.0,700.0)) - 0.5) * 2.0;
  // ----------------------------- Ray march the scene ------------------------------
	float dist = 1.0;
	//float t = 0.1;
  float t = 0.001 + Hash2d(uv)*0.001;	// random dither-fade things close to the camera
   
	vec3 pos;
  float smallVal = 50.0/ 100000.0;
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

    float dist_minus = dist + smallVal ;
    vec3 pos_minus = pos - smallVal * normalize(dir);
    vec3 smallVec = vec3(smallVal, 0, 0);
    vec3 normalU = vec3(dist_minus - DistanceToObject(pos_minus - smallVec.xyy),
                        dist_minus - DistanceToObject(pos_minus - smallVec.yxy),
                        dist_minus - DistanceToObject(pos_minus - smallVec.yyx));
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
    vec3 sunDir = normalize(vec3(90.93, 90.0, 90.5));
    float specular = pow(max(dot((sunDir + (-dir))/2.0 , normal),0.0),5.0); 
    float diffuse = max(dot(sunDir, normal),0.0);
    vec3 lightColor = vec3(0.4)* vec3(diffuse)+specular;
    // a red and blue light coming from different directions
    lightColor += (vec3(0.9, 0.2, 0.4) * saturate(normal.x *0.5+0.5))*pow(ambientAvg, 0.35);
    lightColor += (vec3(0.1, 0.5, 0.99) * saturate(-normal.y *0.5+0.5))*pow(ambientAvg, 0.35);
    // blue glow light coming from the glow in the middle
    lightColor += vec3(0.3, 0.5, 0.9) * saturate(dot(-pos, normal))*pow(ambientS, 0.3);
    if(t<45.0)
      if(val5>=50.0){return lightColor;}else{return normal;}
    else
      return findBackGround(origin,dir);
}

void main(){

  
  vec3 initialRayBlur = initialRay + 5.0/10000.0 * randomUnitDirection(timeSinceStart); 
  vec3 textureData = texture2D(texture, gl_FragCoord.xy / vec2(1000,700)).rgb;
  gl_FragColor = vec4(mix(findColor(eyePos, initialRayBlur), textureData, textureWeight), 1.0);
}
