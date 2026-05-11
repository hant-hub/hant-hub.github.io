#version 300 es
out vec2 uv;

in mat4 model;
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

vec2 uvs[] = vec2[](
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



void main() {
    gl_Position = pv * model * vec4(verts[gl_VertexID % 36], 1.0);
    uv = uvs[gl_VertexID % 36];
}
