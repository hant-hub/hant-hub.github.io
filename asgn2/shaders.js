// Fragment shader program
var DEFAULT_FRAG = `#version 300 es
    precision mediump float;
    in vec4 VertColor;

    out vec4 fragColor;

    void main() {
        fragColor = VertColor;
    }`;

var cube_shader = {
    vert: `#version 300 es
    precision mediump float;
    out vec4 VertColor;
    out vec2 fragUV;
    out vec4 frag_stripe;

    uniform mat4 pv;
    uniform float time;

    vec3 verts[] = vec3[](
        // Back face
        vec3(-0.5f, -0.5f, -0.5f), // Bottom-left
        vec3( 0.5f, -0.5f, -0.5f), // bottom-right    
        vec3( 0.5f,  0.5f, -0.5f), // top-right              
        vec3( 0.5f,  0.5f, -0.5f), // top-right
        vec3(-0.5f,  0.5f, -0.5f), // top-left
        vec3(-0.5f, -0.5f, -0.5f), // bottom-left                
        // Front face
        vec3(-0.5f, -0.5f,  0.5f), // bottom-left
        vec3( 0.5f,  0.5f,  0.5f), // top-right
        vec3( 0.5f, -0.5f,  0.5f), // bottom-right        
        vec3( 0.5f,  0.5f,  0.5f), // top-right
        vec3(-0.5f, -0.5f,  0.5f), // bottom-left
        vec3(-0.5f,  0.5f,  0.5f), // top-left        
        // Left face
        vec3(-0.5f,  0.5f,  0.5f), // top-right
        vec3(-0.5f, -0.5f, -0.5f), // bottom-left
        vec3(-0.5f,  0.5f, -0.5f), // top-left       
        vec3(-0.5f, -0.5f, -0.5f), // bottom-left
        vec3(-0.5f,  0.5f,  0.5f), // top-right
        vec3(-0.5f, -0.5f,  0.5f), // bottom-right
        // Right face
        vec3( 0.5f,  0.5f,  0.5f), // top-left
        vec3( 0.5f,  0.5f, -0.5f), // top-right      
        vec3( 0.5f, -0.5f, -0.5f), // bottom-right          
        vec3( 0.5f, -0.5f, -0.5f), // bottom-right
        vec3( 0.5f, -0.5f,  0.5f), // bottom-left
        vec3( 0.5f,  0.5f,  0.5f), // top-left
        // Bottom face 
        vec3(-0.5f, -0.5f, -0.5f), // top-right
        vec3( 0.5f, -0.5f,  0.5f), // bottom-left
        vec3( 0.5f, -0.5f, -0.5f), // top-left        
        vec3( 0.5f, -0.5f,  0.5f), // bottom-left
        vec3(-0.5f, -0.5f, -0.5f), // top-right
        vec3(-0.5f, -0.5f,  0.5f), // bottom-right
        // Top face
        vec3(-0.5f,  0.5f, -0.5f), // top-left
        vec3( 0.5f,  0.5f, -0.5f), // top-right
        vec3( 0.5f,  0.5f,  0.5f), // bottom-right                 
        vec3( 0.5f,  0.5f,  0.5f), // bottom-right
        vec3(-0.5f,  0.5f,  0.5f), // bottom-left  
        vec3(-0.5f,  0.5f, -0.5f) // top-left              
    );

    vec2 uv[] = vec2[](
        // Back face
        vec2(0.0f, 0.0f), // Bottom-left
        vec2(1.0f, 0.0f), // bottom-right    
        vec2(1.0f, 1.0f), // top-right              
        vec2(1.0f, 1.0f), // top-right
        vec2(0.0f, 1.0f), // top-left
        vec2(0.0f, 0.0f), // bottom-left                
        // Front face
        vec2(0.0f, 0.0f), // bottom-left
        vec2(1.0f, 1.0f), // top-right
        vec2(1.0f, 0.0f), // bottom-right        
        vec2(1.0f, 1.0f), // top-right
        vec2(0.0f, 0.0f), // bottom-left
        vec2(0.0f, 1.0f), // top-left        
        // Left face
        vec2(1.0f, 0.0f), // top-right
        vec2(0.0f, 1.0f), // bottom-left
        vec2(1.0f, 1.0f), // top-left       
        vec2(0.0f, 1.0f), // bottom-left
        vec2(1.0f, 0.0f), // top-right
        vec2(0.0f, 0.0f), // bottom-right
        // Right face
        vec2(0.0f, 1.0f), // top-left
        vec2(1.0f, 1.0f), // top-right      
        vec2(1.0f, 0.0f), // bottom-right          
        vec2(1.0f, 0.0f), // bottom-right
        vec2(0.0f, 0.0f), // bottom-left
        vec2(0.0f, 1.0f), // top-left
        // Bottom face          
        vec2(0.0f, 1.0f), // top-right
        vec2(1.0f, 0.0f), // bottom-left
        vec2(1.0f, 1.0f), // top-left        
        vec2(1.0f, 0.0f), // bottom-left
        vec2(0.0f, 1.0f), // top-right
        vec2(0.0f, 0.0f), // bottom-right
        // Top face
        vec2(0.0f, 1.0f), // top-left
        vec2(1.0f, 1.0f), // top-right
        vec2(1.0f, 0.0f), // bottom-right                 
        vec2(1.0f, 0.0f), // bottom-right
        vec2(0.0f, 0.0f), // bottom-left  
        vec2(0.0f, 1.0f)  // top-left              
    );

    float random (in vec2 st) {
        return fract(sin(dot(st.xy,
            vec2(12.9898,78.233)))
            * 43758.5453123);
    }

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
        (c - a)* u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}


    layout(std140) uniform cubes {
        mat4 model[50];
        mat4 size[50];
        vec4 color[50];
        vec4 stripe[50];
        ivec4 parents[50];
    };

    int getParent(int idx) {
        ivec4 group = parents[idx/4];
        if (idx % 4 == 0) return group.x;
        if (idx % 4 == 1) return group.y;
        if (idx % 4 == 2) return group.z;
        if (idx % 4 == 3) return group.w;
    }

    mat4 getModel(int idx) {
        mat4 base = model[idx];
        int parent = getParent(idx);
        
        int max = 30;
        while (max >= 0 && parent != 0) {
            max--;
            mat4 p = model[parent - 1];
            base = p * base; 

            idx = parent - 1;
            parent = getParent(idx);
        }

        return base;
    }

    vec3 normals[] = vec3[](
        //back face
        vec3(0.0, 0.0, -1.0),
        // Front face
        vec3(0.0, 0.0, 1.0),
        // Left face
        vec3(-1.0, 0.0, 0.0),
        // Right face
        vec3(1.0, 0.0, -1.0),
        // Bottom face          
        vec3(0.0, -1.0, -1.0),
        // Top face
        vec3(0.0, 1.0, -1.0)
    );

    void main() {
        mat4 model = getModel(gl_VertexID/36) * size[gl_VertexID/36];
        vec3 p = (model * vec4(verts[gl_VertexID % 36], 1.0)).xyz;
        gl_Position = pv * model * vec4(verts[gl_VertexID % 36], 1.0);
        //VertColor = vec4(uv[gl_VertexID % 36], 0.0, 1.0);

        frag_stripe = stripe[gl_VertexID/36];       

        float v = 0.8;
        vec3 wind_dir = normalize((vec4(1.0, 0.0, 1.0, 0.0)).xyz);
        v -= 0.3 * (2.0 * noise(p.xz/10.0 + 0.4 * time * wind_dir.xz) - 0.5);

        VertColor = color[gl_VertexID/36] * v;
        fragUV = uv[gl_VertexID % 36];
    }`,

    frag: `#version 300 es
    precision mediump float;

    in vec4 VertColor;
    in vec2 fragUV;
    in vec4 frag_stripe;

    out vec4 fragColor;

    void main() {
        float val = sin(frag_stripe.z * 25.0 * dot(fragUV, frag_stripe.xy));
        if (val < frag_stripe.w) val = 1.0;
        else val = 0.0;
        fragColor = VertColor * val;


        vec2 centered = fragUV - vec2(0.5, 0.5);
        centered = centered * centered;

        float dist = max(centered.x, centered.y);
        if (dist > 0.2) {
            fragColor *= 0.8;
        }
        fragColor.w = 1.0;
    }`,
};

var decor_shader = {
    vert: `#version 300 es
    precision mediump float;
    out vec4 VertColor;
    out vec2 fragUV;

    uniform mat4 pv;
    uniform float time;

    vec3 verts[] = vec3[](
        // Front face
        vec3(-0.5f, -0.5f,  0.0f), // bottom-left
        vec3( 0.5f,  0.5f,  0.0f), // top-right
        vec3( 0.5f, -0.5f,  0.0f), // bottom-right        
        vec3( 0.5f,  0.5f,  0.0f), // top-right
        vec3(-0.5f, -0.5f,  0.0f), // bottom-left
        vec3(-0.5f,  0.5f,  0.0f) // top-left        
    );

    vec2 uv[] = vec2[](
        // Front face
        vec2(0.0f, 0.0f), // bottom-left
        vec2(1.0f, 1.0f), // top-right
        vec2(1.0f, 0.0f), // bottom-right        
        vec2(1.0f, 1.0f), // top-right
        vec2(0.0f, 0.0f), // bottom-left
        vec2(0.0f, 1.0f) // top-left        
    );

    layout(std140) uniform cubes {
        mat4 model[50];
        mat4 size[50];
        vec4 color[50];
        vec4 stripe[50];
        ivec4 parents[50];
    };

    layout(std140) uniform decor {
        mat4 model[25];
        mat4 size[25];
        vec4 tex[25];
        ivec4 parent[25];
    } d;

    int getParent(int idx) {
        ivec4 group = parents[idx/4];
        if (idx % 4 == 0) return group.x;
        if (idx % 4 == 1) return group.y;
        if (idx % 4 == 2) return group.z;
        if (idx % 4 == 3) return group.w;
    }

    mat4 getModel(int idx) {
        mat4 base = d.model[idx];

        ivec4 r = d.parent[idx/4];
        int parent = 0;
        if (idx % 4 == 0) parent = r.x;
        if (idx % 4 == 1) parent = r.y;
        if (idx % 4 == 2) parent = r.z;
        if (idx % 4 == 3) parent = r.w;
        
        if (r.x == 0) base[3][0] += 1.5;

        int max = 30;
        while (max >= 0 && parent != 0) {
            max--;
            mat4 p = model[parent - 1];
            base = p * base; 

            idx = parent - 1;
            parent = getParent(idx);
        }


        return base;
    }

    float random (in vec2 st) {
        return fract(sin(dot(st.xy,
            vec2(12.9898,78.233)))
            * 43758.5453123);
    }

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
        (c - a)* u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

    out float v;

    void main() {
        mat4 model = getModel(gl_VertexID/6) * d.size[gl_VertexID/6];
        gl_Position = pv * model * vec4(verts[gl_VertexID % 6], 1.0);
        vec3 p = (model * vec4(verts[gl_VertexID % 36], 1.0)).xyz;

        VertColor = vec4(uv[gl_VertexID % 6], 0.0, 1.0);
        vec2 offset = d.tex[gl_VertexID/6].xy;
        vec2 scale = d.tex[gl_VertexID/6].zw;

        v = 0.8;
        vec3 wind_dir = normalize((vec4(1.0, 0.0, 1.0, 0.0)).xyz);
        v -= 0.3 * (2.0 * noise(p.xz/10.0 + 0.4 * time * wind_dir.xz) - 0.5);

        fragUV = (scale * uv[gl_VertexID % 6]) + offset;

    }`,

    frag: `#version 300 es
    precision mediump float;

    in vec4 VertColor;
    in vec2 fragUV;
    in float v;

    out vec4 fragColor;

    uniform sampler2D utex;

    void main() {
        //fragColor = VertColor;
        fragColor = texture(utex, fragUV);
        fragColor.xyz *= v;

        //vec2 centered = fragUV - vec2(0.5, 0.5);
        //centered = centered * centered;

        //float dist = max(centered.x, centered.y);
        //if (dist > 0.2) {
        //    fragColor *= 0.8;
        //}
        //fragColor.w = 1.0;
    }`,
};

var grass_shader = {
    vert: `#version 300 es
        precision mediump float;
        in mat4 root;

        uniform mat4 pv;
        uniform float time;
        uniform float scroll;

        vec3 pos[] = vec3[](
            //bottom segment

            vec3(-0.5, 0.0, 0.0),
            vec3(-0.5, 0.5, 0.0),
            vec3(0.5, 0.0, 0.0),

            vec3(0.5, 0.5, 0.0),
            vec3(0.5, 0.0, 0.0),
            vec3(-0.5, 0.5, 0.0),

            //middle segment

            vec3(-0.5, 0.5, 0.0),
            vec3(-0.5, 1.0, 0.0),
            vec3(0.5, 0.5, 0.0),

            vec3(0.5, 1.0, 0.0),
            vec3(0.5, 0.5, 0.0),
            vec3(-0.5, 1.0, 0.0),

            //top
            vec3(-0.5, 1.0, 0.0),
            vec3(0.0, 1.5, 0.0),
            vec3(0.5, 1.0, 0.0)
        );

        out float v;

        //thanks to James_Harnett on ShaderToy for the hashing function
        float hash_WithoutSine(vec2 p)
        {
            vec3 p3  = fract(vec3(p.xyx) * .1031);
            p3 += dot(p3, p3.yzx + 19.19);
            return fract((p3.x + p3.y) * p3.z);
        }

    float random (in vec2 st) {
        return fract(sin(dot(st.xy,
            vec2(12.9898,78.233)))
            * 43758.5453123);
    }

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
        (c - a)* u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

        void main() {
            vec3 p = (root * vec4(pos[gl_VertexID % 15], 1.0)).xyz;
            vec3 probe = (root * vec4(pos[0], 1.0)).xyz;

            vec3 p_n = pos[gl_VertexID % 15];

            vec3 wind_dir = normalize((vec4(1.0, 0.0, 1.0, 0.0)).xyz);

            float r = noise(probe.xz + vec2(10.0));
            float sim = noise(probe.xz);
            sim = sim * 0.5 + 0.5;

            if (r > 1.0) {
                r = 1.0;
            } else if (r < 0.0) {
                r = 0.0;
            }

            float t = 1.5 * time + 0.5 * dot(p, normalize(wind_dir)) + 2.0 * r;
            float s = sin(t);

            if (p_n.y > 0.0) {
                p.y += sim * 1.0;
            }
            p -= s * s * p_n.y * p_n.y * 0.5 * wind_dir;

            float scr = probe.x + scroll;
            if (scr < -25.0) scr = fract((scr + 25.0)/50.0) * 50.0 - 25.0;
            if (scr > 25.0) scr = fract((scr + 25.0)/50.0) * 50.0 - 25.0;
            p.x += scr - probe.x;


            gl_Position = pv * vec4(p, 1.0);

            float fr = time + 0.1 * dot(p, normalize(wind_dir));
            v = (0.1 * r + 0.4);
            
            if (p_n.y < 0.5) {
            } else if (p_n.y < 1.0) {
                v += 0.1;
            } else if (p_n.y < 1.5) {
                v += 0.2;
            } else {
                v += 0.3;
            }

            v -= 0.3 * (2.0 * noise(p.xz/10.0 + 0.4 * time * wind_dir.xz) - 0.5);

            //v = sin(t) * sin(t);

        }
    `,
    frag: `#version 300 es
        precision mediump float;
        out vec4 fragColor;
        in float v;

        void main() {
            fragColor = vec4(0.0, 1.0, 0.0, 1.0) * v;

            fragColor.w = 1.0;
        }
    `
};

