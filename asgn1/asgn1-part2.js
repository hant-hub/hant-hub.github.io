var VSHADER_SOURCE =
    'attribute vec3 a_Position;\n' +
    'attribute vec3 a_Color;\n' +
    'varying vec4 VertColor;\n' +
    'void main() {\n' +
            '  gl_Position = vec4(a_Position.xy/20.0, a_Position.z/100.0, 1.0);\n' +
            '  VertColor = vec4(a_Color, 1.0);\n' +
            '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 VertColor;\n' +
    'void main() {\n' +
            '  gl_FragColor = VertColor;\n' +
            '}\n';

var VCIRC_SRC =
    'attribute vec2 a_Position;\n' +
    'attribute vec3 a_Color;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec4 VertColor;\n' +
    'varying vec2 uv;\n' +
    'void main() {\n' +
        'gl_Position = vec4(a_Position, 0.0, 1.0);\n' +
        'VertColor = vec4(a_Color, 1.0);\n' +
        'uv = a_UV;\n' +
    '}\n';

var FCIRC_SRC =
    'precision mediump float;\n' +
    'varying vec4 VertColor;\n' +
    'varying vec2 uv;\n' +
    'uniform float smoothing;\n' +
    'void main() {\n' +
    '  float pi = 3.14159;\n' +
    '  vec2 center = uv - vec2(0.5, 0.5);\n' +
    '  float d = dot(center, center);\n' +
    '  float angle = atan(center.y, center.x);\n' +
    '  angle = angle * (smoothing / pi);\n' + 
    '  angle = 3.5 * fract(0.5 * (angle - 1.0)) - 1.0;\n' +
    '  angle *= pi/smoothing;\n' +
    '  angle = 1.0/(cos(angle));\n' +
    '  angle *= angle * 1.5;\n' + 
    '  gl_FragColor = VertColor;\n' +
    '  if (d - (angle * 0.01) > 0.0) discard;\n' +
    '  if (d - (angle * 0.008) > 0.0) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '  else if (d - (angle * 0.007) > 0.0) gl_FragColor = vec4(0.5, 0.0, 0.0, 1.0);\n' +
    '  else if (d - (angle * 0.006) > 0.0) gl_FragColor = vec4(0.25, 0.0, 0.0, 1.0);\n' +
    '  else if (d - (angle * 0.005) > 0.0) gl_FragColor = vec4(0.125, 0.0, 0.0, 1.0);\n' +
    '  else if (d - (angle * 0.004) > 0.0) gl_FragColor = vec4(0.125, 0.0, 0.125, 1.0);\n' +
    '  else if (d - (angle * 0.003) > 0.0) gl_FragColor = vec4(0.00, 0.0, 0.25, 1.0);\n' +
    '  else if (d - (angle * 0.002) > 0.0) gl_FragColor = vec4(0.00, 0.0, 0.125, 1.0);\n' +
    '  else if (d - (angle * 0.001) > 0.0) gl_FragColor = vec4(0.0, 0.0, 0.65, 1.0);\n' +
    '}\n';


function main() {

    var ctx = InitGL("webgl");
    var gl = ctx.gl;

    var prog = CompileShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    var cprog = CompileShaders(gl, VCIRC_SRC, FCIRC_SRC);
    gl.useProgram(prog);



    var polygons = CreateVertBuffer(gl, prog, [
        {name : 'a_Position', count : 3, type : gl.FLOAT},
        {name : 'a_Color', count : 3, type : gl.FLOAT},
    ]);

    var circle = CreateVertBuffer(gl, cprog, [
        {name : 'a_Position', count : 2, type : gl.FLOAT},
        {name : 'a_Color', count : 3, type : gl.FLOAT},
        {name : 'a_UV', count : 2, type : gl.FLOAT},
    ]);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    BindVerts(gl, polygons);
    var verticies = new Float32Array([
        //pos   //color

        //background
       -20, -20, 20,  0.31, 0, 0.412,
        20,  20, 20,  0.71, 0, 0,
        20, -20, 20,  0.31, 0, 0.412,

       -20, -20, 20,  0.31, 0, 0.412,
        20,  20, 20,  0.71, 0, 0,
       -20,  20, 20,  0.71, 0, 0,

        //initials
        -15, -15, 1,  1, 1, 1,
        -11, -15, 1,  1, 1, 1,
        -15, -13, 1,  1, 1, 1,

        -15, -13, 1,  1, 1, 1,
        -11, -13, 1,  1, 1, 1,
        -11, -15, 1,  1, 1, 1,

        -15, -13, 1,  1, 1, 1,
        -13, -13, 1,  1, 1, 1,
        -15, -11, 1,  1, 1, 1,

        -15, -11, 1,  1, 1, 1,
        -13, -13, 1,  1, 1, 1,
        -13, -11, 1,  1, 1, 1,

        -15, -11, 1,  1, 1, 1,
        -11, -11, 1,  1, 1, 1,
        -15, -9,  1,  1, 1, 1,

        -15, -9,  1,  1, 1, 1,
        -11, -9,  1,  1, 1, 1,
        -11, -11, 1,  1, 1, 1,

        -15, -9,  1,  1, 1, 1,
        -13, -9,  1,  1, 1, 1,
        -15, -7,  1,  1, 1, 1,

        -15, -7,  1,  1, 1, 1,
        -13, -9,  1,  1, 1, 1,
        -13, -7,  1,  1, 1, 1,

        -15, -7,  1,  1, 1, 1,
        -11, -7,  1,  1, 1, 1,
        -15, -5,  1,  1, 1, 1,

        -15, -5,  1,  1, 1, 1,
        -11, -5,  1,  1, 1, 1,
        -11, -7,  1,  1, 1, 1,

        //H

        -8, -15,  1,  1, 1, 1,
        -6, -15,  1,  1, 1, 1,
        -8, -5,   1,  1, 1, 1,

        -8, -5,   1,  1, 1, 1,
        -6, -15,  1,  1, 1, 1,
        -6, -5,   1,  1, 1, 1,

        -6, -11,  1,  1, 1, 1,
        -4, -11,  1,  1, 1, 1,
        -6, -9,   1,  1, 1, 1,

        -6, -9,   1,  1, 1, 1,
        -4, -11,  1,  1, 1, 1,
        -4, -9,   1,  1, 1, 1,

        -4, -15,  1,  1, 1, 1,
        -2, -15,  1,  1, 1, 1,
        -4, -5,   1,  1, 1, 1,

        -4, -5,   1,  1, 1, 1,
        -2, -15,  1,  1, 1, 1,
        -2, -5,   1,  1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW);

    // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);

    // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
    gl.drawArrays(gl.TRIANGLES, 0, verticies.length/6);


    gl.useProgram(cprog);
    BindVerts(gl, circle);
    gl.disable(gl.DEPTH_TEST);

    var loc = gl.getUniformLocation(circle.prog, 'smoothing');
    gl.uniform1f(loc, 8.0);

    var circ = new Float32Array([
        0.0 + 0.3,  2.0 + 0.3,  0, 0, 1,  0.5, 1.0,
       -2.0 + 0.3, -2.0 + 0.3,  0, 0, 1,  0.0, 0.0,
        2.0 + 0.3, -2.0 + 0.3,  0, 0, 1,  1.0, 0.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, circ, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, circ.length/7);


}
