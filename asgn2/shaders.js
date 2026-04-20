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

    uniform mat4 pv;

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
        vec2(1.0f, 0.0f), // top-left
        vec2(1.0f, 1.0f), // top-right      
        vec2(0.0f, 1.0f), // bottom-right          
        vec2(0.0f, 1.0f), // bottom-right
        vec2(0.0f, 0.0f), // bottom-left
        vec2(1.0f, 0.0f), // top-left
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

    layout(std140) uniform cubes {
        mat4 model[500];
        mat4 size[500];
        vec4 color[500];
        ivec4 parents[500];
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
        gl_Position = pv * model * vec4(verts[gl_VertexID % 36], 1.0);
        //VertColor = vec4(uv[gl_VertexID % 36], 0.0, 1.0);

        VertColor = color[gl_VertexID/36];
        fragUV = uv[gl_VertexID % 36];
    }`,

    frag: `#version 300 es
    precision mediump float;

    in vec4 VertColor;
    in vec2 fragUV;

    out vec4 fragColor;

    void main() {
        fragColor = VertColor;

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
        mat4 model[500];
        mat4 size[500];
        vec4 color[500];
        ivec4 parents[500];
    };

    layout(std140) uniform decor {
        mat4 model[50];
        mat4 size[50];
        vec4 tex[50];
        ivec4 parent[50];
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

    void main() {
        mat4 model = getModel(gl_VertexID/6) * d.size[gl_VertexID/6];
        gl_Position = pv * model * vec4(verts[gl_VertexID % 6], 1.0);

        VertColor = vec4(uv[gl_VertexID % 6], 0.0, 1.0);
        vec2 offset = d.tex[gl_VertexID/6].xy;
        vec2 scale = d.tex[gl_VertexID/6].zw;

        fragUV = (scale * uv[gl_VertexID % 6]) + offset;

    }`,

    frag: `#version 300 es
    precision mediump float;

    in vec4 VertColor;
    in vec2 fragUV;

    out vec4 fragColor;

    uniform sampler2D utex;

    void main() {
        //fragColor = VertColor;
        fragColor = texture(utex, fragUV);

        //vec2 centered = fragUV - vec2(0.5, 0.5);
        //centered = centered * centered;

        //float dist = max(centered.x, centered.y);
        //if (dist > 0.2) {
        //    fragColor *= 0.8;
        //}
        //fragColor.w = 1.0;
    }`,
};

var bone_shader = {
    vert: `#version 300 es
    out vec4 VertColor;
    uniform mat4 pv;

    vec3 verts[] = vec3[](
        //bottom
        vec3(0.0, 0.0, 0.5), 
        vec3(-0.5, 0.0, -0.5), 
        vec3(0.5, 0.0, -0.5), 
        //side1
        vec3(0.0, 0.0, 0.5), 
        vec3(-0.5, 0.0, -0.5), 
        vec3(0.0, 0.5, 0.0), 
        //side2
        vec3(0.0, 0.5, 0.0), 
        vec3(-0.5, 0.0, -0.5), 
        vec3(0.5, 0.0, -0.5), 
        //side3
        vec3(0.0, 0.0, 0.5), 
        vec3(0.0, 0.5, 0.0), 
        vec3(0.5, 0.0, -0.5)
    );

    layout(std140) uniform cubes {
        mat4 model[500];
        mat4 size[500];
        ivec4 parents[500];
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

    void main() {
        mat4 model = getModel(gl_VertexID/12) * size[gl_VertexID/12];
        gl_Position = pv * model * vec4(verts[gl_VertexID % 12], 1.0);
        VertColor = vec4(0.5);
        VertColor.w = 1.0;
    }`
    ,
    frag: DEFAULT_FRAG,
};
