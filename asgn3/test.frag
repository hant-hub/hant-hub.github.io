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
    //fragColor += vec4(uv, 0.0, 1.0);
    //vec4 f = texture(vox, vec3(ivec3(x, y, z)) * vec3(0.5, 0.5, 0.5));
    //fragColor *= f.x + 0.5;

    vec2 center = uv - vec2(0.5);
    center = center * center;
    float dist = max(center.x, center.y);

    if (dist > 0.20) {
        fragColor *= 0.5;
    }


    fragColor.w = 1.0;
}
