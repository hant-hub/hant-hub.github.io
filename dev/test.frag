#version 300 es
precision mediump float;
in vec2 uv;
out vec4 fragColor;

uniform vec2 t;
uniform vec2 t2;

uniform block {
    vec2 test;
    vec2 test2;
} b;

uniform block2 {
    vec2 test;
    vec2 test2;
} b2;

uniform sampler2D utex;

void main() {
    fragColor = texture(utex, uv);  
    fragColor.w = 1.0;
    //fragColor = vec4(uv, 0.0, 1.0);
}
