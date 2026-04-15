var VSHADER_SOURCE = `#version 300 es
    in vec2 a_Position;
    in vec3 a_Color;
    out vec4 VertColor;
    void main() {
        gl_Position = vec4(a_Position, 0.0, 1.0);
        VertColor = vec4(a_Color, 1.0);
    }`;

// Fragment shader program
var FSHADER_SOURCE = `#version 300 es
    precision mediump float;
    in vec4 VertColor;
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

    void main() {
        fragColor = VertColor + vec4(b.test, 0.0, 0.0);
    }`;


function main() {
    var ctx = helpers.InitGL("webgl", true); 
    var gl = ctx.gl;

    var prog = helpers.CompileShaders(ctx, VSHADER_SOURCE, FSHADER_SOURCE);
    var buffer = helpers.CreateVertBuffer(ctx, prog);

    var verticies = [
        0.0,  0.5,  0.0, 0.0, 1.0,
       -0.5, -0.5,  0.0, 0.0, 1.0,
        0.5, -0.5,  0.0, 0.0, 1.0,
    ];

    var verticies2 = [
       -0.5,  0.5,  1.0, 1.0, 1.0,
       -0.5, -0.5,  1.0, 1.0, 1.0,
        0.5, -0.5,  1.0, 1.0, 1.0,
    ];

    helpers.ResizeVertBuffer(ctx, buffer, 6);
    if (helpers.PushVerts(ctx, buffer, verticies)) {
        console.log("hit");
    }
    if (helpers.PushVerts(ctx, buffer, verticies2)) {
        console.log("hit");
    }

    helpers.SubVerts(ctx, buffer, 3, verticies);
    
    var uniform_buf = helpers.CreateUniformBuffer(ctx, prog, 0);
    helpers.UploadUniform(ctx, uniform_buf, 0, [1.0, 1.0]);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    helpers.DrawBuffer(ctx, prog, buffer);
}
