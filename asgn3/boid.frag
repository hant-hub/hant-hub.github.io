#version 300 es
precision mediump float;
precision mediump sampler3D;

in vec2 uv;
out vec4 fragColor;

void main() {
    //fragColor = texture(utex, uv*0.3);  
    fragColor = vec4(0.5);

    vec2 center = uv - vec2(0.5);
    center = center * center;
    float dist = max(center.x, center.y);

    if (dist > 0.20) {
        fragColor *= 0.5;
    }


    fragColor.w = 1.0;
}
