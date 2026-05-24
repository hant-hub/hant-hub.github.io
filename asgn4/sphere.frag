#version 300 es
precision mediump float;
precision mediump sampler3D;

out vec4 fragColor;

in vec3 pos;
in vec3 norm;

uniform int debug_normal;
uniform int light_enable;
uniform int flash_enable;

uniform vec3 point_light;

uniform vec3 obj_color;
uniform vec3 light_color;

uniform vec3 camera;
uniform vec3 flash;
uniform vec3 flash_dir;


void main() {

    fragColor = vec4(light_color, 1.0);

    if (debug_normal > 0) {
        fragColor = vec4(0.5 * (norm + vec3(1.0)), 1.0);
        return;
    }

    if (light_enable == 0) {
        return;
    }

    vec3 lightdir = normalize(point_light - pos);
    vec3 viewdir = normalize(camera - pos);
    float light = dot(norm, lightdir);

    vec3 h = normalize(viewdir + lightdir);
    float spec = pow(max(dot(h, norm), 0.0), 128.0);

    light += spec;

    light = max(light, 0.0);

    if (flash_enable > 0) {
        lightdir = normalize(flash - pos);
        viewdir = normalize(camera - pos);

        float spot = dot(normalize(flash - pos), -flash_dir);
        if (spot > 0.8) {
            spot = pow(spot, 16.0);
            h = normalize(viewdir + lightdir);
            spec = pow(max(dot(h, norm), 0.0), 1024.0);

            light += max(spot * spec, 0.0);
            light += max(spot * dot(norm, lightdir), 0.0);
        }
    }

    fragColor *= light;
    fragColor *= vec4(obj_color, 1.0);
    fragColor += vec4(0.3 * obj_color, 1.0);


    fragColor.w = 1.0;
}
