#version 300 es

in vec3 a_Position;
in vec2 a_uv;
out vec2 uv;
out vec3 pos;

uniform mat4 pv;
uniform vec3 chunk_pos;

float uv_scale = 4.0;

void main() {
    gl_Position = pv * vec4(chunk_pos + a_Position, 1.0);
    pos = a_Position;


    uv = a_uv;
    uv.x /= uv_scale;
}
