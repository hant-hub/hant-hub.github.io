#version 300 es

in vec3 a_Position;
in vec2 a_uv;
out vec2 uv;

uniform mat4 pv;

vec3 positions[] = vec3[](
        //+x
        vec3(1, 1, -1),
        vec3(1, 1, 1),
        vec3(1, -1, -1),

        vec3(1, -1, 1),
        vec3(1, -1, -1),
        vec3(1, 1, 1),

        //-x
        vec3(-1, 1, -1),
        vec3(-1, -1, 1),
        vec3(-1, 1, 1),

        vec3(-1, -1, 1),
        vec3(-1, 1, -1),
        vec3(-1, -1, -1),

        //+y 
        vec3(1, 1, -1),
        vec3(-1, 1, -1),
        vec3(1, 1, 1),

        vec3(-1, 1, 1),
        vec3(1, 1, 1),
        vec3(-1, 1, -1),

        //-y
        vec3(1, -1, 1),
        vec3(-1, -1, -1),
        vec3(1, -1, -1),

        vec3(-1, -1, -1),
        vec3(1, -1, 1),
        vec3(-1, -1, 1),

        //+z
        vec3(1, 1, 1),
        vec3(-1, -1, 1),
        vec3(1, -1, 1),

        vec3(-1, -1, 1),
        vec3(1, 1, 1),
        vec3(-1, 1, 1),

        //-z
        vec3(1, -1, -1),
        vec3(-1, -1, -1),
        vec3(1, 1, -1),

        vec3(-1, 1, -1),
        vec3(1, 1, -1),
        vec3(-1, -1, -1)
);

vec2 uvs[] = vec2[](
        //+x
        vec2(1, 0),
        vec2(1, 1),
        vec2(0, 0),
        vec2(0, 1),
        vec2(0, 0),
        vec2(1, 1),

        //-x
        vec2(1, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(0, 1),
        vec2(1, 0),
        vec2(0, 0),

        //+y
        vec2(1, 0),
        vec2(0, 0),
        vec2(1, 1),
        vec2(0, 1),
        vec2(1, 1),
        vec2(0, 0),

        //-y
        vec2(1, 1),
        vec2(0, 0),
        vec2(1, 0),
        vec2(0, 0),
        vec2(1, 1),
        vec2(0, 1),

        //+z
        vec2(1, 1),
        vec2(0, 0),
        vec2(1, 0),
        vec2(0, 0),
        vec2(1, 1),
        vec2(0, 1),

        //-z
        vec2(1, 0),
        vec2(0, 0),
        vec2(1, 1),
        vec2(0, 1),
        vec2(1, 1),
        vec2(0, 0)
);

float uv_scale = 6.0;
float uv_offset = 1.0/6.0;

uniform vec3 pos;

void main() {
    gl_Position = pv * vec4(positions[gl_VertexID] + pos, 1.0);
    uv = uvs[gl_VertexID];

    uv.x /= uv_scale;
    uv.x += float(int(gl_VertexID/6)) * uv_offset;
}
