#version 300 es
precision mediump sampler3D;

in vec3 a_Position;
in vec2 a_uv;
out vec2 uv;
out vec3 pos;
out float ao;

uniform mat4 pv;
uniform vec3 chunk_pos;

uniform sampler3D vox;

float uv_scale = 4.0;

void main() {
    gl_Position = pv * vec4(chunk_pos + a_Position, 1.0);
    pos = a_Position;


    uv = a_uv;
    uv.x /= uv_scale;

    vec3 s = pos - vec3(0.5);

    float f0 = sign(texture(vox, vec3(ivec3(s + vec3(-0.5, -0.5, -0.5))) * vec3(1.0/32.0)).r);
    float f1 = sign(texture(vox, vec3(ivec3(s + vec3(-0.5, -0.5,  0.5))) * vec3(1.0/32.0)).r);
    float f2 = sign(texture(vox, vec3(ivec3(s + vec3(-0.5,  0.5, -0.5))) * vec3(1.0/32.0)).r);
    float f3 = sign(texture(vox, vec3(ivec3(s + vec3(-0.5,  0.5,  0.5))) * vec3(1.0/32.0)).r);
    float f4 = sign(texture(vox, vec3(ivec3(s + vec3( 0.5, -0.5, -0.5))) * vec3(1.0/32.0)).r);
    float f5 = sign(texture(vox, vec3(ivec3(s + vec3( 0.5, -0.5,  0.5))) * vec3(1.0/32.0)).r);
    float f6 = sign(texture(vox, vec3(ivec3(s + vec3( 0.5,  0.5, -0.5))) * vec3(1.0/32.0)).r);
    float f7 = sign(texture(vox, vec3(ivec3(s + vec3( 0.5,  0.5,  0.5))) * vec3(1.0/32.0)).r);

    float fill = f0 + f1 + f2 + f3 + f4 + f5 + f6 + f7;
    fill /= 8.0;
    fill = 1.0 - fill;

    ao = (0.8 * fill) + 0.2;
}
