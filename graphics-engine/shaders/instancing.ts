export const vectorInstancing = 
`#version 300 es
in vec4 inputPosition;
in vec3 inputNormal;
in vec2 inputUV;

in mat4 modelview;

uniform mat4 projection;

out vec3 normalInterp;
out vec3 vertPos;
out vec2 vTexcoord;

void main() {
  gl_Position = projection * modelview * inputPosition;
  vec4 vertPos4 = modelview * inputPosition;
  vertPos = vec3(vertPos4) / vertPos4.w;

  normalInterp = inputNormal;
  vTexcoord = inputUV;
}
`;

export const fragmentInstancing = 
`#version 300 es
precision highp float;

in vec3 normalInterp;
in vec3 vertPos;
in vec2 vTexcoord;

uniform sampler2D uTexture;

out vec4 fragColor;

const vec3 lightPos = vec3(1.0, 1.0, 60.0);
const vec3 lightColor = vec3(1.0, 1.0, 1.0);
const float lightPower = 1000.0;

const vec3 ambientColor = vec3(0.5, 0.5, 0.5);
const vec3 diffuseColor = vec3(0.5, 0.5, 0.5);
const vec3 specColor = vec3(0.8, 0.8, 0.8);
const float shininess = 16.0;

void main() {
  vec3 normal = normalize(normalInterp);
  vec3 lightDir = lightPos - vertPos;
  float distance = length(lightDir);
  distance = distance * distance;
  lightDir = normalize(lightDir);

  float lambertian = max(dot(lightDir, normal), 0.0);
  float specular = 0.0;
  if (lambertian > 0.0) {
    vec3 viewDir = normalize(-vertPos);
    vec3 halfDir = normalize(lightDir + viewDir);
    float specAngle = max(dot(halfDir, normal), 0.0);
    specular = pow(specAngle, shininess);
  }

  vec3 colorLinear = texture(uTexture, vTexcoord).xyz * ambientColor +
                      diffuseColor * lambertian * lightColor * lightPower / distance +
                      specColor * specular * lightColor * lightPower / distance;

  

  fragColor = vec4(colorLinear, 1.0);
}
`;