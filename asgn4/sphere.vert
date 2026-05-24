#version 300 es
precision mediump sampler3D;

in vec3 a_Position;
in vec3 a_norm;

out vec3 norm;
out vec3 pos;

uniform mat4 pv;
uniform mat4 m;

void main() {
    gl_Position = pv * m * vec4(a_Position, 1.0);
    pos = a_Position;
    norm = a_norm;
}
