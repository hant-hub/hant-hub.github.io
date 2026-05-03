#version 300 es

in vec3 a_Position;
out vec2 uv;

uniform mat4 pv;

void main() {
    gl_Position = pv * vec4(a_Position, 1.0);
    uv = vec2(0);
}
