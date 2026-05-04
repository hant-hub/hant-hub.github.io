#version 300 es

in vec3 a_Position;
in vec2 a_uv;
out vec2 uv;

uniform mat4 pv;

void main() {
    gl_Position = pv * vec4(a_Position, 1.0);
    uv = a_uv;
}
