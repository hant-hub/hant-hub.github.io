#version 300 es
precision mediump float;
precision mediump sampler3D;

in vec2 uv;
out vec4 fragColor;

uniform sampler2D utex;
uniform sampler3D vox;

uniform int x;
uniform int y;
uniform int z;

void main() {


    fragColor = texture(utex, uv);  
    vec4 f = texture(vox, vec3(ivec3(x, y, z)));

    fragColor *= f.x + 0.5;

    fragColor.w = 1.0;
}
