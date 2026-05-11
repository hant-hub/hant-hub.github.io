#version 300 es
precision mediump float;

in vec2 uv;
out vec4 fragColor;

uniform sampler2D skybox;

void main() {
    fragColor = texture(skybox, uv);  
    //fragColor = vec4(uv, 0.0, 1.0);
    fragColor.w = 1.0;
}
