#version 300 es
precision mediump float;
precision mediump sampler3D;

in vec2 uv;
in float ao;
out vec4 fragColor;

in vec3 pos;
in vec3 cpos;
in vec3 norm;

uniform vec3 cursor;

uniform sampler2D utex;
uniform sampler3D vox;

float uv_offset = 1.0/4.0;

vec3 lightdir = vec3(1.0, 1.0, 0.0);

void main() {

    vec3 s = vec3(ivec3(pos));

    vec4 f = texture(vox, s * vec3(1.0/32.0));
    if (f.r == 0.0) {
        s = vec3(ivec3(pos - vec3(0.01)));
        f = texture(vox, s * vec3(1.0/32.0));
    }

    vec2 coord = uv;
    coord.x += uv_offset * ((f.r * 256.0) - 1.0);

    fragColor = texture(utex, coord);  

    if (ao < 1.0) fragColor *= ao;

    //borrowed from Dan Pokhrel who shared his stuff early,
    //although this is just a basic fog shader which blends between
    //a fog color based on the depth


    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = exp(-0.001 * depth);
    vec4 fogColor = vec4(0.4, 0.3, 0.1, 1.0);
    fragColor = mix(fogColor, fragColor, fogFactor);

    float lambert = dot(norm, lightdir);
    if (lambert < 0.5) lambert = 0.5;

    fragColor *= lambert;

    vec3 diff = ((round(s) + cpos) - cursor);
    float dist = dot(diff, diff);
    if (dist < 1.0) {
        vec2 centered = uv;
        centered.x *= 4.0;
        centered -= vec2(0.5, 0.5);
        centered = centered * centered;

        float dist = max(centered.x, centered.y);
        if (dist > 0.2) {
            fragColor = vec4(0.4);
        }
    }


    fragColor.w = 1.0;
}
