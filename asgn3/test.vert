#version 300 es

in vec2 a_Position;
in vec2 a_tex;
out vec2 uv;

void main() {
    gl_Position = vec4(a_Position, 0.0, 1.0);
    uv = a_tex;
}
