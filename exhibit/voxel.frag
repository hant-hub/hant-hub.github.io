#version 300 es
precision mediump float;
precision mediump sampler3D;

in vec2 uv;
out vec4 fragColor;

in vec3 pos;

uniform sampler2D utex;
uniform sampler3D vox;

float uv_offset = 1.0/4.0;

void main() {

    vec4 f = texture(vox, vec3(ivec3(pos)) * 1.0/32.0);
    if (f.r == 0.0) {
        f = texture(vox, vec3(ivec3(pos - vec3(0.01))) * 1.0/32.0);
    }

    vec2 coord = uv;
    coord.x += uv_offset * ((f.r * 256.0) - 1.0);

    fragColor = texture(utex, coord);  


    vec2 center = uv - vec2(0.5);
    center = center * center;
    float dist = max(center.x, center.y);

    if (dist > 0.20) {
        //fragColor *= 0.5;
    }


    fragColor.w = 1.0;
}
